import { ObjectId } from 'mongodb'

export interface UnFollowReqParams {
  userId: string
}

export interface FollowerReqBody {
  follower_user_id: string

}

export interface UpdateProfileReqBody {
  name?: string
  date_of_birth?: string
  bio?: string
  avatar?: string
  location?: string
  website?: string
  username?: string
  cover_photo?: string
}

export interface RegisterReqBody {
  email: string
  password: string
  name: string
  confirmPassword: string
  date_of_birth: string
}

export interface ForgotPasswordReqBody {
  email: string
}

export interface ResetPasswordReqBody {
  userId: string
  password: string
}

export interface changePasswordReqBody {
  oldPassword: string
  password: string
  confirmPassword: string

}

export interface UserInfo {
  email: string
  userId: ObjectId
}
