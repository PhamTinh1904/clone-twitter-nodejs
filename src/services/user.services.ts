import mongoClient from '~/configs/config.mongodb'
import { RegisterReqBody, UpdateProfileReqBody } from '~/models/requests/user.request'
import { User, UserVerifyStatus } from '~/models/schemas/User.schema'
import bcrypt from 'bcrypt'
import { createEmailVerifyToken, createForgotPasswrodToken, createTokenPair } from '~/auth/authUtils'
import crypto from 'crypto'
import KeyTokenService from './keyToken.services'
import { AuthFailureError, BadRequestError } from '~/core/error.response'
import { getInfoData } from '~/utils'
import { ObjectId } from 'mongodb'
import _ from 'lodash'
import { hashPassword } from '~/utils/hashPassword'

class UserServices {
  changePassword = async (userId: string, password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
      throw new BadRequestError('Password and confirm password do not match!')
    }

    const user = await mongoClient.users.findOne({ _id: new ObjectId(userId) })
    if (!user) throw new AuthFailureError('User not found!')

    const passwordHash = await hashPassword(password)

    const result = await mongoClient.users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          password: passwordHash,
          updatedAt: new Date()
        }
      }
    )

    return result
  }

  resetPassword = async (userId: string, password: string) => {
    const foundUser = await mongoClient.users.findOne({ _id: new ObjectId(userId) })
    if (!foundUser) throw new AuthFailureError(`User not found!`)

    const passwordHash = await bcrypt.hash(password, 10)
    console.log(passwordHash)

    const result = await mongoClient.users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          password: passwordHash,
          forgot_password_token: '',
          updatedAt: new Date()
        }
      }
    )
    return result
  }

  verifyForgotPasswordToken = async ({ userId, token }: { userId: string; token: string }) => {
    const user = await mongoClient.users.findOne({ _id: new ObjectId(userId) })
    if (!user) throw new AuthFailureError('Not found!')
    if (user && user.forgot_password_token === token) {
      return 'Token is valid!'
    }
  }

  forgotPassword = async (email: string) => {
    const foundUser = await mongoClient.users.findOne({ email })
    const userId = foundUser?._id

    if (!foundUser) throw new AuthFailureError('User not found!')

    const forgot_password_token = await createForgotPasswrodToken(
      { email, userId: userId as ObjectId },
      process.env.JWT_FORGOT_PASSWORD_SECRET as string
    )

    if (!forgot_password_token) throw new BadRequestError('Forgot password token error!')

    const updateForgotPasswordToken = await mongoClient.users.updateOne({ email }, [
      {
        $set: {
          forgot_password_token: forgot_password_token as string,
          updatedAt: '$$NOW'
        }
      }
    ])
    if (updateForgotPasswordToken.acknowledged) {
      // Gửi link forgot_password
      return forgot_password_token
    }
  }

  resendVerifyEmail = async (userId: string) => {
    const foundUser = await mongoClient.users.findOne({ _id: new ObjectId(userId) })

    if (!foundUser) throw new AuthFailureError(`User not found!`)

    if (foundUser.verify !== UserVerifyStatus.verified) {
      const email_verify_token = await createEmailVerifyToken(
        new ObjectId(userId),
        process.env.VERIFY_EMAIL_SECRET as string
      )

      const rsultResenEmail = await mongoClient.users.updateOne(
        {
          _id: new ObjectId(userId)
        },
        {
          $set: {
            email_verify_token: email_verify_token as string
          }
        }
      )
      return rsultResenEmail
    }

    return 'Email verified!!'
  }
  verifyEmail = async ({ userId, token }: { userId: string; token: string }) => {
    try {
      const user = await mongoClient.users.findOne({ _id: new ObjectId(userId) })

      console.log(user?.email_verify_token)

      if (user && user.email_verify_token === token) {
        await mongoClient.users.updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: { email_verify_token: '', verify: UserVerifyStatus.verified },
            $currentDate: {
              updatedAt: true
            }
          }
        )

        return 'Email verified successfully!!'
      }
      throw new AuthFailureError('Invalid token!')
    } catch (error) {
      throw new BadRequestError('Error verifying email token!')
    }
  }

  logout = async (keyUser: any) => {
    const delKey = await KeyTokenService.removeKeyById(keyUser._id)

    return delKey
  }
  login = async ({ email, password }: { email: string; password: string }) => {
    const foundUser = await mongoClient.users.findOne({ email })

    if (!foundUser) {
      throw new BadRequestError('User not registered!')
    }

    const match = await bcrypt.compare(password, foundUser.password)
    if (!match) throw new AuthFailureError('Authentication failed!')

    const privateKey = crypto.randomBytes(64).toString('hex')
    const publicKey = crypto.randomBytes(64).toString('hex')

    const { _id: userId } = foundUser

    const tokens = await createTokenPair({ userId }, publicKey, privateKey)

    await KeyTokenService.createKeyToken({
      userId,
      privateKey,
      publicKey,
      refreshToken: tokens.refreshToken
    })

    return {
      user: getInfoData({ fields: ['_id', 'name', 'email'], object: foundUser }),
      tokens
    }
  }
  register = async (payload: RegisterReqBody) => {
    const userId = new ObjectId()
    const passwordHash = await hashPassword(payload.password)
    const email_verify_token = await createEmailVerifyToken(userId, process.env.VERIFY_EMAIL_SECRET as string)
    const result = await mongoClient.users.insertOne(
      new User({
        _id: userId,
        ...payload,
        password: passwordHash,
        date_or_birth: new Date(payload.date_of_birth),
        email_verify_token: email_verify_token as string
      })
    )

    if (result) {
      const privateKey = crypto.randomBytes(64).toString('hex')
      const publicKey = crypto.randomBytes(64).toString('hex')

      const keyUser = await KeyTokenService.createKeyToken({ userId: result.insertedId, publicKey, privateKey })

      if (!keyUser) {
        return {
          code: 'xxx',
          message: 'publicKeyString err'
        }
      }
      const tokens = await createTokenPair({ _id: result.insertedId }, publicKey, privateKey)

      return {
        result,
        tokens
      }
    }
  }

  getProfileUser = async (user_id: string) => {
    const user = await mongoClient.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0
        }
      }
    )
    return user
  }

  updateProfile = async (userId: string, payload: UpdateProfileReqBody) => {
    const result = await mongoClient.users.findOneAndUpdate(
      {
        _id: new ObjectId(userId)
      },
      {
        $set: {
          ...payload
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          createdAt: 0,
          updatedAt: 0
        }
      }
    )

    return result
  }

  followOneUser = async (userId: string, follower_user_id: string) => {
    const followed_user_id = await mongoClient.followers.findOne({
      user_id: new ObjectId(userId),
      follower_user_id: new ObjectId(follower_user_id)
    })

    if (followed_user_id) return ''

    const result = await mongoClient.followers.insertOne({
      user_id: new ObjectId(userId),
      follower_user_id: new ObjectId(follower_user_id)
    })

    return result
  }

  unFollowOneUser = async (userId: string, follower_user_id: string) => {
    const followed = await mongoClient.followers.findOne({
      user_id: new ObjectId(userId),
      follower_user_id: new ObjectId(follower_user_id)
    })
    console.log(followed)

    if (!followed) {
      return 'User had unfollowed!'
    }

    const result = await mongoClient.followers.deleteOne({
      user_id: new ObjectId(userId),
      follower_user_id: new ObjectId(follower_user_id)
    })

    if (result.deletedCount > 0) {
      return result
    }
  }
}

export default new UserServices()
