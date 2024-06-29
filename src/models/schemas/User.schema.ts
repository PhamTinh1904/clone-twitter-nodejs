import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'


interface UserType {
  _id?: ObjectId
  name: string
  email: string
  date_or_birth: Date
  password: string
  email_verify_token?: string
  forgot_password_token?: string
  verify?: UserVerifyStatus
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
  createdAt?: Date
  updatedAt?: Date
}

export class User {
  _id?: ObjectId
  name: string
  email: string
  date_or_birth: Date
  password: string
  email_verify_token: string
  forgot_password_token: string
  verify: UserVerifyStatus
  bio: string
  location: string
  website: string
  username: string
  avatar: string
  cover_photo: string
  createdAt: Date
  updatedAt: Date
  constructor(user: UserType) {
    this.name = user.name || ''
    this.email = user.email
    this.date_or_birth = user.date_or_birth || new Date()
    this.password = user.password
    this.email_verify_token = user.email_verify_token || ''
    this.forgot_password_token = user.forgot_password_token || ''
    this.verify = user.verify || UserVerifyStatus.unverified
    this.bio = user.bio || ''
    this.location = user.location || ''
    this.website = user.website || ''
    this.username = user.username || ''
    this.avatar = user.avatar || ''
    this.cover_photo = user.cover_photo || ''
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }
}
