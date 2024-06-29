
import { ReasonPhrases, StatusCodes } from '~/utils/httpStatusCode'

export interface CustomError extends Error {
  status?: number
}

class ErrorResponse extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

class ConflictRequestError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.CONFLICT, status: number = StatusCodes.CONFLICT) {
    super(message, status)
  }
}

class BadRequestError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.BAD_REQUEST, status: number = StatusCodes.BAD_REQUEST) {
    super(message, status)
  }
}

class AuthFailureError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.UNAUTHORIZED, status: number = StatusCodes.UNAUTHORIZED) {
    super(message, status)
  }
}

class NotFoundError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.NOT_FOUND, status: number = StatusCodes.NOT_FOUND) {
    super(message, status)
  }
}

class ForBiddenError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.FORBIDDEN, status: number = StatusCodes.FORBIDDEN) {
    super(message, status)
  }
}

export { ErrorResponse, ConflictRequestError, BadRequestError, AuthFailureError, NotFoundError, ForBiddenError }
