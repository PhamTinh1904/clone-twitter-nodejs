import { ObjectId } from 'mongodb'

export class KeyToken {
  user: ObjectId
  privateKey: string
  publicKey: string
  refreshToken: string
  refreshTokenUsed: []
  constructor(user: ObjectId,privateKey: string, publicKey: string, refreshToken: string, refreshTokenUsed: [] = []){
    this.user = user
    this.privateKey = privateKey
    this.publicKey = publicKey
    this.refreshToken = refreshToken
    this.refreshTokenUsed = refreshTokenUsed
  }
}
