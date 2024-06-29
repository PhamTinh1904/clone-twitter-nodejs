import {Router} from 'express'
import userRouter from './user'


const router = Router()

router.use('/v1/api/user', userRouter)

export default router