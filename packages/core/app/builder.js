const proxy = require('http-proxy-middleware')
const express = require('express')
const path = require('path')
const { isEmpty, isString } = require('lodash')
const logger = require('./logger')
const useParser = require('./use/parser')
const useTemplates = require('./use/templates')
const useState = require('./use/state')
const { loadService, loadHooverService, loadStatic } = require('./io')

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

      if (def.service) {
        const api = require('./api')(req, res)
        const service = loadService(root, verb)
        response = await service(api)
      }

      if (def.static) {
        response = loadStatic(root, req.params, verb)
      }

      if (def.body) {
        response = def.body
      }

      // Don't apply any template if the responseType is 'file'.
      if (
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

  if (def.proxy) {
    if (!this.proxies) {
      this.proxies = []
    }

    const path = [''].concat(root)

    let onProxyRes
    if (def.hoover) {
      const hooverService = loadHooverService(root)

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
              hooverService(json, api)
            } catch (e) {
              console.log('Hoover error: could not encode string to JSON')
              console.log(str)
              console.log(e)
            }
          }
        })
      }
    }

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
