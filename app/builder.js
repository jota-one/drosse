const {
  createProxyMiddleware,
  responseInterceptor,
} = require('http-proxy-middleware')
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

const getProxy = function (def) {
  return typeof def.proxy === 'string' ? { target: def.proxy } : def.proxy
}

const setRoute = function (app, def, verb, root) {
  app[verb](
    `${state.get('basePath')}/${root.join('/')}`,
    getThrottleMiddleware(def),
    async (req, res, next) => {
      let response
      let applyTemplate = true
      let staticExtension = 'json'

      if (def.service) {
        const api = require('./api')(req, res)
        const service = loadService(root, verb)
        try {
          response = await service(api)
        } catch (e) {
          return next(e)
        }
      }

      if (def.static) {
        try {
          const { params, query } = req
          const { extensions } = def
          const [ result, extension ] = await loadStatic({ routePath: root, params, verb, query, extensions })
          response = result
          staticExtension = extension
          if (!response) {
            const [ result, extension ] = await loadScraped({
              routePath: root,
              params,
              verb,
              query,
              extensions,
            })
            applyTemplate = false
            response = result
            staticExtension = extension

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
        staticExtension === 'json' &&
        def.template &&
        Object.keys(def.template).length
      ) {
        response = templates.list()[def.template](response)
      }

      // send response
      if (def.responseType === 'file' || (staticExtension && staticExtension !== 'json')) {
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

  logger.success(
    `-> ${verb.toUpperCase().padEnd(7)} ${state.get('basePath')}/${root.join(
      '/'
    )}`
  )
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
    const proxyResHooks = []

    const path = [''].concat(root)

    const onProxyReq = function (proxyReq, req, res) {
      res.set('x-proxied', true)

      // restream body, if any
      if (!isEmpty(req.body)) {
        const bodyData = JSON.stringify(req.body)
        // If content-type is application/x-www-form-urlencoded -> we need to change to application/json
        proxyReq.setHeader('Content-Type', 'application/json')
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
        // stream the content
        proxyReq.write(bodyData)
      }
    }

    const applyProxyRes = function (hooks, def) {
      if (hooks.length === 0) {
        return
      }
      return responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        const response = responseBuffer.toString('utf8') // convert buffer to string
        try {
          const json = JSON.parse(response)
          hooks.forEach(hook => hook(json, req, res))
          return JSON.stringify(json)
        } catch (e) {
          console.log('Response error: could not encode string to JSON')
          console.log(response)
          console.log(e)
          console.log(
            'Will try to fallback on the static mock or at least return a vaild JSON string.'
          )

          return JSON.stringify(def.body) || '{}' // fallback on the def.body if any or a stringified empty JSON object to avoid an automatic Drosse crash.
        }
      })
    }
    if (def.scraper) {
      let tmpProxy = def.proxy
      if (!tmpProxy) {
        tmpProxy = defHierarchy.reduce((acc, item) => {
          if (item.proxy) {
            return {
              proxy: getProxy(item),
              path: item.path,
            }
          } else {
            if (!acc) {
              return acc
            }
            const subpath = difference(item.path, acc.path)
            const proxy = getProxy(acc)

            proxy.target = proxy.target.split('/').concat(subpath).join('/')

            return {
              proxy,
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

      proxyResHooks.push((json, req, res) => {
        const api = require('./api')(req, res)
        scraperService(json, api)
      })
    }

    if (def.proxy) {
      // add some response rewriter if any
      if (def.proxy.responseRewriters) {
        def.proxy.selfHandleResponse = true
        def.proxy.responseRewriters.forEach(rewriterName => {
          const path = './middlewares/json-response/' + rewriterName
          proxyResHooks.push(require(path))
        })
      }

      this.proxies.push({
        path: path.join('/'),
        context: {
          ...getProxy(def),
          changeOrigin: true,
          selfHandleResponse: Boolean(proxyResHooks.length),
          pathRewrite: {
            [path.join('/')]: '/',
          },
          onProxyReq,
          onProxyRes: applyProxyRes(proxyResHooks, def),
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
      createProxyMiddleware({ ...context, logLevel: 'warn' }),
    ]
    app.use(path || '/', middlewares)

    logger.info(`-> PROXY   ${path || '/'} => ${context.target}`)
  })
}

module.exports = { createRoutes }
