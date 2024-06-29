import { Collection, Db, MongoClient } from 'mongodb'
import 'dotenv/config'
import { User } from '~/models/schemas/User.schema'
import { error } from 'console'
import { KeyToken } from '~/models/schemas/KeyToken.schema'
import { Follower } from '~/models/schemas/Follower.schema'

const userName = process.env.DEV_DB_USERNAME
const password = process.env.DEV_DB_PASSWORD
const nameDB = process.env.DEV_DB_NAME

const uri = `mongodb+srv://${userName}:${password}@cluster0.lxnwd35.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

class MongoDB {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(nameDB)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (err) {
      console.log(error)
    }
  }

  get users(): Collection<User> {
    return this.db.collection('users')
  }

  get keys(): Collection<KeyToken> {
    return this.db.collection('keys')
  }

  get followers(): Collection<Follower>{
    return this.db.collection('followers')
  }
}

const mongoClient = new MongoDB()

export default mongoClient
