import { NextFunction } from 'express'
import JWT, { JwtPayload } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { AuthFailureError, BadRequestError, CustomError, NotFoundError } from '~/core/error.response'
import asyncHandler from '~/helpers/asyncHandler'
import { UserInfo } from '~/models/requests/user.request'
import KeyTokenService from '~/services/keyToken.services'

const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization',
  REFRESHTOKEN: 'x-rtoken-id'
}

const createTokenPair = async (payload: any, publicKey: string, privateKey: string) => {
  try {
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: '2 days'
    })
    const refreshToken = await JWT.sign(payload, privateKey, { expiresIn: '2 days' })

    return { accessToken, refreshToken }
  } catch (error: any) {
    return { error: error.message }
  }
}

const createEmailVerifyToken = async (userId: ObjectId, secretKey: string) => {
  try {
    const emailVerifyToken = await JWT.sign({ userId }, secretKey)

    return emailVerifyToken
  } catch (error: any) {
    return { error: error.message }
  }
}

const createForgotPasswrodToken = async (payload: UserInfo, secretKey: string) => {
  try {
    const forgotPasswrodToken = await JWT.sign({ ...payload }, secretKey)

    return forgotPasswrodToken
  } catch (error: any) {
    return { error: error.message }
  }
}

const   authencationV2 = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
  const userId = req.headers[HEADER.CLIENT_ID]

  if (!userId) throw new AuthFailureError('Invalid request!')

  const keyUser = await KeyTokenService.findByUserId(userId)

  if (!keyUser) throw new NotFoundError('Key user not found!')

  const refreshToken = req.headers[HEADER.REFRESHTOKEN]
  if (refreshToken) {
    try {
      const decodeUser = JWT.verify(refreshToken as string, keyUser.privateKey) as JwtPayload

      if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid user Id!')

      req.keyUser = keyUser
      req.user = decodeUser
      req.refreshToken = refreshToken

      return next()
    } catch (error) {
      throw new AuthFailureError('Invalid token!')
    }
  } else {
    throw new BadRequestError('Invalid request!')
  }
})

export { createTokenPair, authencationV2, createEmailVerifyToken, createForgotPasswrodToken }
