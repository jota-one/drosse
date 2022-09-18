import supertest from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { describe as describeDrosse, init, start, stop } from '../src/app'

const root = './test/mocks'
const version = 'test'

describe('serve', () => {
  let emitted, host
  const emit = event => { emitted = event }

  beforeAll(async () => {
    await init(root, emit, version)
    const d = describeDrosse()
    host = `${d.proto}://localhost:${d.port}`
    await start()
  })

  afterAll(async () => {
    await stop()
  })

  it('serves the app on correct port', async () => {
    const res = await supertest(host).get('/')
    expect(res.statusCode).toBe(404)
  })

  it('exposes reserved routes', async () => {
    let res = await supertest(host).get('/UI')
    expect(res.statusCode).toBe(200)

    res = await supertest(host).get('/CMD')
    expect(res.statusCode).toBe(405)
  })

  it('returns routes definition via /UI', async () => {
    const res = await supertest(host).get('/UI')
    expect(JSON.parse(res.text)).toMatchObject({
      routes: {
        throttle: {
          DROSSE: {
            throttle: {
              min: 3000,
              max: 3000
            }
          }
        },
        static: {
          DROSSE: {
            get: {
              static: true
            }
          }
        }
      }
    })
  })

  it('restarts server via /CMD', async () => {
    const res = await supertest(host).post('/CMD').send({ cmd: 'restart' })
    expect(res.statusCode).toBe(200)
    expect(emitted).toBe('restart')
  })

  it('throttles request', async () => {
    const res = await supertest(host).get('/throttle')
    expect(res.statusCode).toBe(200)
  })
})
