import { defineDrosseService } from '../../../src/index'
import { getRouterParam } from 'h3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

export default defineDrosseService(({ event }) => {
  const name = getRouterParam(event, 'name')
  return join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', name)
})
