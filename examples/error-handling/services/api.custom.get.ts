import { defineDrosseService } from '../../..'
import CustomError from '../errors/CustomError'

export default defineDrosseService(async ({ event }) => {
  throw new CustomError({
    code: 'NOT_ALLOWED',
    httpCode: 504,
    level: 'WARNING',
    message: 'You are not allowed to do this...'
  })
})