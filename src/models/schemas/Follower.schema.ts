import { ObjectId } from 'mongodb'


interface FollowerType {
  _id?: ObjectId
  user_id: ObjectId
  follower_user_id: ObjectId
  createdAt?: Date
  updatedAt?: Date
}

export class Follower {
  _id?: ObjectId
  user_id: ObjectId
  follower_user_id: ObjectId
  createdAt?: Date
  updatedAt?: Date
  constructor(follower: FollowerType) {
  this.user_id = follower.user_id
  this.follower_user_id = follower.follower_user_id
  this.createdAt = new Date()
  this.updatedAt = new Date()
  }
}
