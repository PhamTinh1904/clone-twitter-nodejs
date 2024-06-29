import mongoClient from '~/configs/config.mongodb'

const checkIsExitEmail = async (email: string) => {
  const holderUser = await mongoClient.users.findOne({ email })
  return holderUser
}

export { checkIsExitEmail }
