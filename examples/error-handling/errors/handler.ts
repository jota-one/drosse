import { H3Error, H3Event } from 'h3'
import { defineErrorHandler } from '../../../'
import response from '../templates/response'
import CustomError from './CustomError'

export default defineErrorHandler(async (error: H3Error, event: H3Event) => {
  if (error.cause instanceof CustomError) {
    return {
      statusCode: error.cause.httpCode,
      response: response(null, {
        code: error.cause.code,
        level: error.cause.level,
        message: error.cause.message
      })
    }
  }

  return {
    statusCode: 500,
    response: response(null, error.message)
  }
})
