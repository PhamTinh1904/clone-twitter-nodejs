import { Router } from 'express'
import { authencationV2 } from '~/auth/authUtils'
import userController from '~/controllers/user.controller'
import asyncHandler from '~/helpers/asyncHandler'
import {
  changePasswordValidator,
  followerValidator,
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordTokenValidator,
  unFolowValidator,
  updateValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/user.middleware'

const userRouter = Router()
/**
 * Description: Submit email reset password
 * path: /forgot-password
 * Method: POST
 * Body: {email: string}
 */
userRouter.post('/forgot-password', asyncHandler(forgotPasswordValidator), asyncHandler(userController.forgotPassword))
userRouter.get(
  '/verify-forgot-password',
  asyncHandler(verifyForgotPasswordTokenValidator),
  asyncHandler(userController.verifyForgotPasswordToken)
)

userRouter.post(
  '/reset-password',
  asyncHandler(resetPasswordTokenValidator),
  asyncHandler(userController.resetPassword)
)

userRouter.put('/change-password', asyncHandler(changePasswordValidator), asyncHandler(userController.changePassword))

userRouter.post('/register', asyncHandler(registerValidator), userController.registerController)
userRouter.get('/verify-email', asyncHandler(userController.verifyEmailController))

userRouter.post('/login', asyncHandler(loginValidator), asyncHandler(userController.login))

userRouter.use(authencationV2)
userRouter.post('/follow', asyncHandler(followerValidator), asyncHandler(userController.followOneUser))
userRouter.delete('/follow/:userId', asyncHandler(unFolowValidator), asyncHandler(userController.unFollowOneUser))

userRouter.post('/logout', userController.logout)
userRouter.post('/resend-verify-email', asyncHandler(userController.resendVerifyEmail))
userRouter.get('/profile', asyncHandler(userController.getProfileUser))
userRouter.patch('/profile', asyncHandler(updateValidator), asyncHandler(userController.updateProfileUser))

export default userRouter
