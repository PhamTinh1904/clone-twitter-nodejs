import express, { NextFunction } from 'express'
import mongoClient from '~/configs/config.mongodb'
import { CustomError } from '~/core/error.response'
import router from '~/routes'

const app = express()

const port = 3000

app.use(express.json())
app.use('', router)
app.use((req, res, next) => {
  const error: CustomError = new Error('Not found!');
  error.status = 404
  next(error)
})

app.use((error : CustomError, req: any, res: any, next: NextFunction) => {
  const statusCode = error.status || 500;

  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    stack: error.stack,
    message: error.message || "Internal Server Error",
  });
});
mongoClient.connect()

app.listen(port, () => {
  console.log(`Listening on ${port}`)
})
