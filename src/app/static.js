import { promises as fs } from 'fs'
import { join } from 'path'

import { createApp } from 'h3'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { listen } from 'listhen'
import serveStatic from 'serve-static'

import internalMiddlewares from './middlewares'

export default function(root, port, proxy) {
  const app = createApp({ debug: true })

  app.use(internalMiddlewares.morgan)
  const staticMw = serveStatic(root, { fallthrough: false, redirect: false })

  if (proxy) {
    const proxyMw = createProxyMiddleware({
      target: proxy,
      changeOriging: true
    })

    app.use(async (req, res) => {
      let fileExists

      try {
        await fs.access(join(root, req.url))
        fileExists = true
      } catch {
        fileExists = false
      }

      // Workaround for h3 not awaiting next
      // => cf. https://github.com/unjs/h3/issues/35
      return new Promise((resolve, reject) => {
        const next = err => {
          if (err) {
            reject(err)
          } else {
            resolve(true)
          }
        }

        return fileExists
          ? staticMw(req, res, next)
          : proxyMw(req, res, next)
      })
    })
  } else {
    app.use('/', staticMw)
  }

  listen(app, { port })
}