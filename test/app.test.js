import { describe, expect, it } from 'vitest'
import { describe as describeDrosse, init } from '../src/app'

const root = './test/mocks'
const version = 'test'

describe('app', () => {
  let emitted, host
  const emit = event => { emitted = event }

  it('describes instance', async () => {
    await init('./test/mocks', () => {}, version)
    const d = describeDrosse()
    host = `${d.proto}://127.0.0.1:${d.port}`

    expect(d).toMatchObject({
      isDrosse: true,
      version: 'test',
      uuid: 'ca76497d-52f5-4f06-8b48-5003688f5bbb',
      name: 'Test mocks',
      proto: 'http',
      port: 3636,
      routesFile: 'routes',
      collectionsPath: 'collections'
    })
  })

  it.todo('starts the app', async () => {
    // TODO start a dedicated instance not used in any other test to be sure we can test "connection" refused on instance port when not started
  })

  it.todo('stops the app', async () => {
    // TODO same as in start test
  })

  it.todo('restarts the app', async () => {
    // TODO same as in start test
  })
})
