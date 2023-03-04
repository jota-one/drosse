import supertest from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { describe as describeDrosse, init, start, stop } from '../src/app'

const root = './examples/database'
const version = 'test'
const newName = 'Jozel'
const newPower = 'fly'
const newUser = 'Chewy'

describe('database', async () => {
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

  it('lists users', async () => {
    const res = await supertest(host).get('/api/users')
    expect(JSON.parse(res.text))
      .toHaveLength(2)
      .toContainEqual({ name: 'Jorinho', powers: [] })
  })

  it('updates user name', async () => {
    let res = await supertest(host)
      .put('/api/users/2')
      .send({ name: newName })

    expect(res.statusCode).toBe(200)

    res = await supertest(host).get('/api/users')

    expect(JSON.parse(res.text))
      .toHaveLength(2)
      .toContainEqual({ name: newName, powers: [] })
  })

  it('applies new power', async () => {
    let res = await supertest(host)
      .post('/api/users/2/powers')
      .send({ id: newPower })

    expect(res.statusCode).toBe(200)

    res = await supertest(host).get('/api/users')

    expect(JSON.parse(res.text))
      .toHaveLength(2)
      .toContainEqual({
        name: newName,
        powers: expect.arrayContaining([
          expect.objectContaining({ name: newPower })
        ])
      })
  })

  it('creates new user', async () => {
    const newUser = 'Chewy'

    let res = await supertest(host)
      .post('/api/users')
      .send({ id: 3, name: newUser })

    expect(res.statusCode).toBe(200)

    res = await supertest(host).get('/api/users')

    expect(JSON.parse(res.text))
      .toHaveLength(3)
      .toContainEqual(expect.objectContaining({ name: newUser }))
  })

  it('deletes the newly created user', async () => {
    let res = await supertest(host)
      .delete('/api/users/3')

    expect(res.statusCode).toBe(200)

    res = await supertest(host).get('/api/users')

    expect(JSON.parse(res.text))
      .toHaveLength(2)
  })
})
