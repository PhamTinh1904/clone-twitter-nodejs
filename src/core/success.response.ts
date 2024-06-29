import { StatusCodes, ReasonPhrases } from '../utils/httpStatusCode'

interface ResponseInterface {
  message: string
  statusCode?: number
  reasonStatusCode?: string
  metadata: any
}

class SuccessResponse {
  message: string
  statusCode: number
  metadata = {}
  constructor({
    message,
    statusCode = StatusCodes.OK,
    reasonStatusCode = ReasonPhrases.OK,
    metadata = {}
  }: ResponseInterface) {
    this.message = !message ? reasonStatusCode : message
    this.statusCode = statusCode
    this.metadata = metadata
  }

  send(res: any, headers: any = {}): any {
    return res.status(this.statusCode).json(this)
  }
}

class CREATED extends SuccessResponse{
  constructor({message , statusCode = StatusCodes.CREATED, reasonStatusCode = ReasonPhrases.CREATED, metadata} : ResponseInterface){
      super({message, statusCode, reasonStatusCode, metadata})
  }
}

export {SuccessResponse, CREATED}