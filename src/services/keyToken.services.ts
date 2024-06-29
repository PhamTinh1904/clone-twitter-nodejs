import { ObjectId } from 'mongodb'
import mongoClient from '~/configs/config.mongodb'
import { CustomError } from '~/core/error.response'
import { convertToObjectIdMongodb } from '~/utils'

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken
  }: {
    userId: ObjectId
    publicKey: string
    privateKey: string
    refreshToken?: string
  }) => {
    try {
      const filter = { user: userId },
        options = { upsert: true, new: true }

      const updatTokens = await mongoClient.keys.findOneAndUpdate(
        filter,
        {
          $set: {
            publicKey,
            privateKey,
            refreshTokenUsed: [],
            refreshToken
          }
        },
        options
      )

      const tokens = await mongoClient.keys.findOne({ publicKey })
      console.log(tokens)

      return tokens ? tokens.publicKey : null
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  static findByUserId = async (userId: string) => {
    const filter = { user: convertToObjectIdMongodb(userId) }
    const tokens = await mongoClient.keys.findOne(filter)
    return tokens
  }

  static removeKeyById = async(id: string)=>{
    return await mongoClient.keys.deleteOne({_id: convertToObjectIdMongodb(id)})
  }
}

export default KeyTokenService
