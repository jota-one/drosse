import { defineDrosseServer } from '../../'
import errorHandler from './errors/handler'

export default defineDrosseServer ({
  name: 'Example error handling app',
  errorHandler
})
