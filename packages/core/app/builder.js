const proxy = require('http-proxy-middleware')
const express = require('express')
const path = require('path')
const { isEmpty, isString, difference } = require('lodash')
const logger = require('./logger')
const useParser = require('./use/parser')
const useTemplates = require('./use/templates')
const useState = require('./use/state')
const useIo = require('./use/io')

const { loadService, loadScraperService, loadStatic, loadScraped } = useIo()
const { parse } = useParser()
const state = useState()
const templates = useTemplates()

const getThrottle = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

const getThrottleMiddleware = def => {
  return (req, res, next) => {
    if (!def.throttle) {
      return next()
    }
    setTimeout(
      next,
      getThrottle(def.throttle.min || 0, def.throttle.max || def.throttle.min)
    )
  }
}

const setRoute = function (app, def, verb, root) {
  app[verb](
    '/' + root.join('/'),
    getThrottleMiddleware(def),
    async (req, res, next) => {
      let response
      let applyTemplate = true

      if (def.service) {
        const api = require('./api')(req, res)
        const service = loadService(root, verb)
        response = await service(api)
      }

      if (def.static) {
        try {
          const { params, query } = req
          response = loadStatic({ routePath: root, params, verb, query })
          if (!response) {
            response = loadScraped({ routePath: root, params, verb, query })
            applyTemplate = false

            if (!response) {
              applyTemplate = true
              response = {
                drosse: `loadStatic: file not found with routePath = ${root.join(
                  '/'
                )}`,
              }
            }
          }
        } catch (e) {
          response = {
            drosse: e.message,
          }
        }
      }

      if (def.body) {
        response = def.body
        applyTemplate = true
      }

      // Don't apply any template if the responseType is 'file'.
      if (
        applyTemplate &&
        def.responseType !== 'file' &&
        def.template &&
        Object.keys(def.template).length
      ) {
        response = templates.list()[def.template](response)
      }

      // send response
      if (def.responseType === 'file') {
        return res.sendFile(response, function (err) {
          if (err) {
            logger.error(err.stack)
          } else {
            logger.success('File downloaded successfully')
          }
        })
      }

      return res.send(response)
    }
  )

  logger.success(`-> ${verb.toUpperCase().padEnd(7)} /${root.join('/')}`)
}

const createRoute = function (def, root, defHierarchy) {
  const app = this
  const inheritance = []

  ;['get', 'post', 'put', 'delete']
    .filter(verb => def[verb])
    .forEach(verb => {
      // set throttling
      const originalThrottle = !isEmpty(def[verb].throttle)
      def[verb].throttle =
        def[verb].throttle ||
        defHierarchy.reduce((acc, item) => item.throttle || acc, {})

      if (!originalThrottle && !isEmpty(def[verb].throttle)) {
        inheritance.push({ path: root.join('/'), type: 'throttle', verb })
      }

      // set template
      const originalTemplate =
        def[verb].template === null || Boolean(def[verb].template)
      def[verb].template = originalTemplate
        ? def[verb].template
        : defHierarchy.reduce((acc, item) => item.template || acc, {})

      if (!originalTemplate && def[verb].template) {
        inheritance.push({ path: root.join('/'), type: 'template', verb })
      }

      // create route
      setRoute(app, def[verb], verb, root)
    })

  if (def.assets) {
    if (!this.assets) {
      this.assets = []
    }

    const routePath = [''].concat(root)
    const assetsSubPath =
      def.assets === true
        ? routePath
        : isString(def.assets)
          ? def.assets.split('/')
          : def.assets
    this.assets.push({
      path: routePath.join('/'),
      context: { target: path.join(state.get('assetsPath'), ...assetsSubPath) },
    })
  }

  if (def.proxy || def.scraper) {
    if (!this.proxies) {
      this.proxies = []
    }

    const path = [''].concat(root)

    let onProxyRes
    if (def.scraper) {
      let tmpProxy = def.proxy
      if (!tmpProxy) {
        tmpProxy = defHierarchy.reduce((acc, item) => {
          if (item.proxy) {
            return {
              proxy: item.proxy,
              path: item.path,
            }
          } else {
            if (!acc) {
              return acc
            }
            const subpath = difference(item.path, acc.path)
            return {
              proxy: acc.proxy.split('/').concat(subpath).join('/'),
              path: item.path,
            }
          }
        }, null)
        def.proxy = tmpProxy && tmpProxy.proxy
      }
      let scraperService
      if (def.scraper.service) {
        scraperService = loadScraperService(root)
      } else if (def.scraper.static) {
        const useScraper = require('./use/scraper')
        scraperService = useScraper().staticService
      }

      onProxyRes = function (proxyRes, req, res) {
        const zlib = require('zlib')
        const bodyChunks = []

        proxyRes.on('data', chunk => {
          bodyChunks.push(chunk)
        })

        proxyRes.on('end', () => {
          const body = Buffer.concat(bodyChunks)
          if (
            proxyRes.headers['content-type'] &&
            proxyRes.headers['content-type'].includes('application/json')
          ) {
            const isGzip = res.getHeader('content-encoding') === 'gzip'
            const str = isGzip
              ? zlib.gunzipSync(body).toString()
              : body.toString()

            try {
              const json = JSON.parse(str)
              const api = require('./api')(req, res)
              scraperService(json, api)
            } catch (e) {
              console.log('Scraper error: could not encode string to JSON')
              console.log(str)
              console.log(e)
            }
          }
        })
      }
    }

    if (def.proxy) {
      this.proxies.push({
        path: path.join('/'),
        context: {
          target: def.proxy,
          changeOrigin: true,
          pathRewrite: {
            [path.join('/')]: '/',
          },
          onProxyReq: restream,
          onProxyRes,
        },
        def,
      })
    }
  }

  return inheritance
}

const createRoutes = (app, routes) => {
  app.proxies = []
  app.assets = []
  const inherited = parse({ routes, onRouteDef: createRoute.bind(app) })
  const result = inherited.reduce((acc, item) => {
    if (!acc[item.path]) {
      acc[item.path] = {}
    }
    if (!acc[item.path][item.verb]) {
      acc[item.path][item.verb] = {
        template: false,
        throttle: false,
        proxy: false,
      }
    }
    acc[item.path][item.verb][item.type] = true
    return acc
  }, {})
  createAssets(app)
  createProxies(app)
  return result
}

const restream = function (proxyReq, req, res) {
  res.set('x-proxied', true)
  if (req.body) {
    const bodyData = JSON.stringify(req.body)
    // If content-type is application/x-www-form-urlencoded -> we need to change to application/json
    proxyReq.setHeader('Content-Type', 'application/json')
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
    // stream the content
    proxyReq.write(bodyData)
  }
}

const createAssets = app => {
  if (!app.assets) {
    return
  }

  app.assets.forEach(({ path: routePath, context }) => {
    app.use(
      routePath,
      express.static(path.join(state.get('root'), context.target))
    )

    logger.info(
      `-> STATIC ASSETS   ${routePath || '/'} => ${path.join(
        state.get('root'),
        context.target
      )}`
    )
  })
}

const createProxies = app => {
  if (!app.proxies) {
    return
  }

  app.proxies.forEach(({ path, context, def }) => {
    const middlewares = [
      getThrottleMiddleware(def),
      proxy.createProxyMiddleware({ ...context, logLevel: 'warn' }),
    ]
    app.use(path || '/', middlewares)

    logger.info(`-> PROXY   ${path || '/'} => ${context.target}`)
  })
}

module.exports = { createRoutes }
