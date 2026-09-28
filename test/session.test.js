import supertest from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { describe as describeDrosse, init, start, stop } from '../src/app'

const root = './examples/session'
const version = 'test'

describe('session', async () => {
  let emitted, host, cookies
  const emit = event => { emitted = event }

  beforeAll(async () => {
    await init(root, emit, version)
    const d = describeDrosse()
    host = `${d.proto}://127.0.0.1:${d.port}`
    await start()
  })

  afterAll(async () => {
    await stop()
  })

  it('refuses access by default', async () => {
    const res = await supertest(host).get('/')
    expect(res.statusCode).toBe(401)
  })

  it('starts session via POST', async () => {
    const res = await supertest(host).post('/auth')
    cookies = res.headers['set-cookie']
    expect(res.statusCode).toBe(200)
  })

  it('allows access once session is started', async () => {
    const res = await supertest(host).get('/').set('Cookie', cookies).send()
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.text)).toMatchObject({ connected: true })
  })
})
