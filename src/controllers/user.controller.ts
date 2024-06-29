import { Request, Response } from 'express'

import { ParamsDictionary } from 'express-serve-static-core'
import {
  FollowerReqBody,
  ForgotPasswordReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  UnFollowReqParams,
  UpdateProfileReqBody,
  changePasswordReqBody
} from '~/models/requests/user.request'
import { CREATED, SuccessResponse } from '~/core/success.response'
import UserServices from '~/services/user.services'
import _ from 'lodash'
import userServices from '~/services/user.services'

interface RegisterRequest extends Request {
  body: {
    email: string
    password: string
  }
}

class userController {
  logout = async (req: any, res: Response) => {
    new SuccessResponse({
      message: 'Logout successfully!!',
      metadata: await UserServices.logout(req.keyUser)
    }).send(res)
  }

  login = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
    new SuccessResponse({
      message: 'Login successfully!!',
      metadata: await UserServices.login({ ...req.body })
    }).send(res)
  }
  registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
    new CREATED({
      message: 'Register successfully!!',
      metadata: await UserServices.register(req.body)
    }).send(res)
  }

  verifyEmailController = async (req: any, res: Response) => {
    new SuccessResponse({
      message: 'Verify email successfully!!',
      metadata: await UserServices.verifyEmail(req.query)
    }).send(res)
  }

  resendVerifyEmail = async (req: any, res: Response) => {
    new SuccessResponse({
      message: 'Verify email successfully!!',
      metadata: await UserServices.resendVerifyEmail(req.user.userId)
    }).send(res)
  }

  forgotPassword = async (req: Request<ParamsDictionary, any, ForgotPasswordReqBody>, res: Response) => {
    const { email } = req.body
    new SuccessResponse({
      message: 'Verify email successfully!!',
      metadata: await UserServices.forgotPassword(email)
    }).send(res)
  }

  verifyForgotPasswordToken = async (req: any, res: Response) => {
    const userId = req.userId

    new SuccessResponse({
      message: 'Verify email successfully!!',
      metadata: await UserServices.verifyForgotPasswordToken({ userId, ...req.query })
    }).send(res)
  }

  resetPassword = async (req: any, res: Response) => {
    const userId = req.userId
    console.log(userId)

    const { password } = req.body
    new SuccessResponse({
      message: 'Verify email successfully!!',
      metadata: await UserServices.resetPassword(userId, password)
    }).send(res)
  }

  changePassword = async (
    req: Request<ParamsDictionary, any, changePasswordReqBody> & { user: { userId: string } },
    res: Response
  ) => {
    const { userId } = req.user
    const { password, confirmPassword } = req.body
    new SuccessResponse({
      message: 'Change password successfully!!',
      metadata: await UserServices.changePassword(userId, password, confirmPassword)
    }).send(res)
  }

  getProfileUser = async (req: any, res: Response) => {
    const { userId } = req.user
    new SuccessResponse({
      message: 'Get profile user successfully!!',
      metadata: await UserServices.getProfileUser(userId)
    }).send(res)
  }

  updateProfileUser = async (
    req: Request<ParamsDictionary, any, UpdateProfileReqBody> & { user: { userId: string } },
    res: Response
  ) => {
    const { userId } = req.user
    const body = _.pick(req.body, [
      'name',
      'date_of_birth',
      'bio',
      'avatar',
      'location',
      'website',
      'username',
      'cover_photo'
    ])
    new SuccessResponse({
      message: 'Update profile user successfully!!',
      metadata: await UserServices.updateProfile(userId, body)
    }).send(res)
  }

  followOneUser = async (
    req: Request<ParamsDictionary, any, FollowerReqBody> & { user: { userId: string } },
    res: Response
  ) => {
    const { userId } = req.user
    const { follower_user_id } = req.body
    new SuccessResponse({
      message: 'Follow user successfully!!',
      metadata: await UserServices.followOneUser(userId, follower_user_id)
    }).send(res)
  }

  unFollowOneUser = async (req: Request<UnFollowReqParams> & { user: { userId: string } }, res: Response) => {
    const { userId } = req.user
    const { userId: followedUserId } = req.params
    new SuccessResponse({
      message: 'Unfollow user successfully!!',
      metadata: await userServices.unFollowOneUser(userId, followedUserId)
    }).send(res)
  }
}

export default new userController()
