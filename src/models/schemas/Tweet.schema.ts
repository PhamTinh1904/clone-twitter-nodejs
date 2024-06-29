import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType } from '~/constants/enums'


interface Tweet {
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId
  hashtags: string[]
  mentions: string[]
  medias: null
  guest_views: number
  user_views: number
  created_at: Date
  updated_at: Date
}
