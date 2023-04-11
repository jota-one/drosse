import { defineDrosseService } from '../../../src'
import type { DrosseServiceApi, DrosseServiceCallback } from '../../../'
import { biggerThan10 } from '../helpers'

const serviceCallback: DrosseServiceCallback =
  ({ config }: DrosseServiceApi): any => {
    return {
      configName: config.name,
      biggerThan10: biggerThan10({ input: 'I am bigger than 10!!', num: 12 })
    }
  }

export default defineDrosseService(serviceCallback)
