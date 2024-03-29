import supertest from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { describe as describeDrosse, init, start, stop } from '../src/app'

const root = './test/mocks'
const version = 'test'

describe('serve', () => {
  let emitted, host
  const emit = event => {
    emitted = event
  }

  beforeAll(async () => {
    await init(root, emit, version)
    const d = describeDrosse()
    host = `${d.proto}://127.0.0.1:${d.port}`
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
    expect(res.statusCode).toBe(404)
  })

  it('returns routes definition via /UI', async () => {
    const res = await supertest(host).get('/UI')
    expect(JSON.parse(res.text)).toMatchObject({
      routes: {
        throttle: {
          DROSSE: {
            throttle: {
              min: 3000,
              max: 3000,
            },
          },
        },
        static: {
          DROSSE: {
            get: {
              static: true,
            },
          },
        },
      },
    })
  })

  it('restarts server via /CMD', async () => {
    const res = await supertest(host).post('/CMD').send({ cmd: 'restart' })
    expect(res.statusCode).toBe(200)
    expect(emitted).toBe('restart')
  })

  it('drops the db via /CMD', async () => {
    const res = await supertest(host).post('/CMD').send({ cmd: 'db drop' })
    expect(JSON.parse(res.text)).toMatchObject({
      restarted: true,
      dbDropped: true,
    })
  })

  it('throttles request', async () => {
    const res = await supertest(host).get('/throttle')
    expect(res.statusCode).toBe(200)
  })

  it('throttles dynamic route', async () => {
    const res = await supertest(host).get('/throttle/10')
    expect(res.statusCode).toBe(200)
  })

  it('applies template', async () => {
    let res = await supertest(host).get('/template/hateoas')
    expect(JSON.parse(res.text)).toMatchObject({
      links: [
        {
          rel: 'link1',
          href: 'http://somehost/link/1',
        },
      ],
    })

    res = await supertest(host).get('/template/hal')
    expect(JSON.parse(res.text)).toMatchObject({
      _links: {
        link1: {
          href: 'http://somehost/link/1',
        },
      },
    })
  })

  it('proxies requests', async () => {
    const listener = await start()
    const d = describeDrosse()
    const port2 = listener.server.address().port
    const host2 = `${d.proto}://127.0.0.1:${port2}`
    const trim = str => str.replace(/[\n\r\s\t]?/gim, '')

    const res1 = await supertest(host).get('/template/hal')
    const res2 = await supertest(host2).get('/proxy/hal')

    expect(trim(res1.text).replaceAll('http://somehost/', '/')).toEqual(
      trim(res2.text)
    )

    await stop()
  })

  it('overwrites proxied request with local route', async () => {
    const listener = await start()
    const d = describeDrosse()
    const port2 = listener.server.address().port
    const host2 = `${d.proto}://127.0.0.1:${port2}`

    const res = await supertest(host2).get('/proxy/hal/overwrite')

    expect(res.text).toEqual('overwritten!')
  })

  it('loads static file with param and no verb in filename', async () => {
    const res = await supertest(host).get('/static/labels/en')
    expect(JSON.parse(res.text).label1).toBe('English')
  })

  it('loads static file with param in filename', async () => {
    const res = await supertest(host).get('/static/labels/de')
    expect(JSON.parse(res.text).label1).toBe('Any other language')
  })

  it('loads asset from assets dir', async () => {
    let res = await supertest(host).get('/image/cat.jpg')
    expect(res.statusCode).toBe(200)
    expect(res.headers['content-type']).toBe('image/jpeg')

    res = await supertest(host).get('/image/bird.jpg')
    expect(res.statusCode).toBe(404)
  })

  it('loads asset from specified file', async () => {
    const res = await supertest(host).get('/image/dog.jpg')
    expect(res.statusCode).toBe(200)
    expect(res.headers['content-type']).toBe('image/jpeg')
  })

  it('loads asset with wildcard', async () => {
    const res = await supertest(host).get('/image/animals/bird.jpg')
    expect(res.statusCode).toBe(200)
    expect(res.headers['content-type']).toBe('image/jpeg')
    expect(res.headers['x-wildcard-asset-target']).toBe('assets/image/cat.jpg')
  })

  it('loads asset with wildcard (wrong url)', async () => {
    const res = await supertest(host).get('/image/other/bird.jpg')
    expect(res.statusCode).toBe(404)
  })

  it('loads asset with multiple wildcards', async () => {
    const res = await supertest(host).get(
      '/image/animals/domestic-a/feline-b.jpg'
    )
    expect(res.statusCode).toBe(200)
    expect(res.headers['content-type']).toBe('image/jpeg')
    expect(res.headers['x-wildcard-asset-target']).toBe('assets/image/cat.jpg')
  })

  it('loads asset with multiple wildcards and not ending with any extension', async () => {
    const res = await supertest(host).get(
      '/image/animals/domestic-a/feline-blabla'
    )
    expect(res.statusCode).toBe(200)
    expect(res.headers['content-type']).toBe('image/jpeg')
    expect(res.headers['x-wildcard-asset-target']).toBe('assets/image/cat.jpg')
  })

  it('loads asset with multiple wildcards (wrong url, missing the second -*)', async () => {
    const res = await supertest(host).get(
      '/image/animals/domestic-a/feline.jpg'
    )
    expect(res.statusCode).toBe(404)
  })

  it('loads asset with full resource as wildcard', async () => {
    const res = await supertest(host).get('/image/animals/whale/cute')
    expect(res.statusCode).toBe(200)
    expect(res.headers['content-type']).toBe('image/jpeg')
    expect(res.headers['x-wildcard-asset-target']).toBe('assets/image/cat.jpg')
  })

  it('loads asset with full resource as wildcard, but bad name after', async () => {
    const res = await supertest(host).get('/image/animals/whale/ugly')
    expect(res.statusCode).toBe(404)
  })

  it.skip('loads asset with full resource as wildcard, but bad name after, but containing the good name', async () => {
    const res = await supertest(host).get('/image/animals/whale/cute-but-ugly')
    expect(res.statusCode).toBe(404)
  })
})
