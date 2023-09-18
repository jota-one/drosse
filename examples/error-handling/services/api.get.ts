import { defineDrosseService } from '../../..'

export default defineDrosseService(async ({ event }) => {
  throw new Error('oops...')
})