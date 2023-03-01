import { join } from 'path'

import { getQuery, getResponseHeader, getRouterParams, setResponseHeader, fromNodeMiddleware } from 'h3'
import {
  createProxyMiddleware,
  responseInterceptor,
} from 'http-proxy-middleware'
import serveStatic from 'serve-static'

import { isEmpty } from '../helpers'
import logger from './logger'
import internalMiddlewares from './middlewares'

import useAPI from './composables/useAPI'
import useIO from './composables/useIO'
import useParser from './composables/useParser'
import useScraper from './composables/useScraper'
import useState from './composables/useState'
import useTemplates from './composables/useTemplates'

const { loadService, loadScraperService, loadStatic, loadScraped } = useIO()
const { parse } = useParser()
const state = useState()
const templates = useTemplates()

const getThrottle = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

const getThrottleMiddleware = def => async () => new Promise(resolve => {
    const delay = getThrottle(
      def.throttle.min || 0,
      def.throttle.max || def.throttle.min
    )
    setTimeout( resolve, delay )
  })

const getProxy = function (def) {
  return typeof def.proxy === 'string' ? { target: def.proxy } : def.proxy
}

const createRoutes = async (app, router, routes) => {
  const context = { app, router, proxies: [], assets: [] }
  const inherited = await parse({
    routes,
    onRouteDef: await createRoute.bind(context)
  })

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

  createAssets(context)
  createProxies(context)

  return result
}

const createRoute = async function (def, root, defHierarchy) {
  const { router, app, proxies, assets } = this
  const inheritance = []
  const verbs = ['get', 'post', 'put', 'delete'].filter(verb => def[verb])

  for (const verb of verbs) {
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

    if (!originalTemplate && Object.keys(def[verb].template).length) {
      inheritance.push({ path: root.join('/'), type: 'template', verb })
    }

    // create route
    const inheritsProxy = Boolean(defHierarchy.find(item =>
      root.join('/').includes(item.path.join('/'))
    )?.proxy)

    await setRoute(app, router, def[verb], verb, root, inheritsProxy)
  }

  // handle assets
  if (def.assets) {
    const routePath = [''].concat(root)
    const assetsSubPath =
      def.assets === true
        ? routePath
        : typeof def.assets === 'string'
          ? def.assets.split('/')
          : def.assets

    assets.push({
      path: routePath.join('/'),
      context: { target: join(state.get('assetsPath'), ...assetsSubPath) },
    })
  }

  if (def.proxy || def.scraper) {
    const proxyResHooks = []
    const path = [''].concat(root)

    const onProxyReq = async function (proxyReq, req, res) {
      return new Promise((resolve, reject) => {
        try {
          // restream body, if any
          if (!isEmpty(req.body)) {
            const bodyData = JSON.stringify(req.body)
            // If content-type is application/x-www-form-urlencoded -> we need to change to application/json
            proxyReq.setHeader('Content-Type', 'application/json')
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
            // stream the content
            proxyReq.write(bodyData)
          }

          resolve()
        } catch(e) {
          reject(e)
        }
      })
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
            const subpath = item.path.filter(path => !acc.path.includes(path))
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
        scraperService = await loadScraperService(root)
      } else if (def.scraper.static) {
        scraperService = useScraper().staticService
      }

      proxyResHooks.push((json, req, res) => {
        const api = useAPI(req, res)
        scraperService(json, api)
      })
    }

    if (def.proxy) {
      // add some response rewriter if any
      if (def.proxy.responseRewriters) {
        def.proxy.selfHandleResponse = true
        def.proxy.responseRewriters.forEach(rewriterName => {
          proxyResHooks.push(internalMiddlewares[rewriterName])
        })
      }

      proxies.push({
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

const setRoute = async (app, router, def, verb, root, inheritsProxy) => {
  const path = `${state.get('basePath')}/${root.join('/')}`

  if (Object.keys(def.throttle).length) {
    app.use(path, getThrottleMiddleware(def))
  }

  const handler = async (req, res, next) => {
    let response
    let applyTemplate = true
    let staticExtension = 'json'

    if (def.service) {
      const api = useAPI(req, res)
      const { serviceFile, service } = await loadService(root, verb)
      try {
        response = await service(api)
      } catch (e) {
        console.log('Error in service', serviceFile, e)
        return next(e)
      }
    }

    if (def.static) {
      try {
        const params = getRouterParams(req)
        const query = getQuery(req)
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
          stack: e.stack
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
    if (
      def.responseType === 'file' ||
      (staticExtension && staticExtension !== 'json')
    ) {
      return res.sendFile(response, function (err) {
        if (err) {
          logger.error(err.stack)
        } else {
          logger.success('File downloaded successfully')
        }
      })
    }

    return response
  }

  if (inheritsProxy) {
    // We defined a middleware for the route so that if overwrites the proxy middleware
    app.use(path, handler, { match: url => url === '/' })
  } else {
    router[verb](path, fromNodeMiddleware(handler))
  }

  logger.success(
    `-> ${verb.toUpperCase().padEnd(7)} ${state.get('basePath')}/${root.join(
      '/'
    )}`
  )
}

const createAssets = ({ app, assets }) => {
  if (!assets) {
    return
  }

  const _assets = []

  assets.forEach(({ path: routePath, context }) => {
    const fsPath = join(state.get('root'), context.target)

    let mwPath = routePath

    if (routePath.includes('*')) {
      mwPath = mwPath.substring(0, mwPath.indexOf('*'))
      mwPath = mwPath.substring(0, mwPath.lastIndexOf('/'))

      const re = new RegExp(routePath.replaceAll('*', '[^/]*'))

      app.use(mwPath, (req, res) => {
        if (re.test(`${mwPath}${req.url}`)) {
          setResponseHeader(
            res,
            'x-wildcard-asset-target',
            context.target
          )
        }
      })

      _assets.push({ mwPath, fsPath, wildcardPath: routePath })
    } else {
      _assets.push({ mwPath, fsPath })
    }
  })

  _assets.forEach(({ mwPath, fsPath, wildcardPath }) => {
    app.use(mwPath, (req, res, next) => {
      const wildcardAssetTarget = getResponseHeader(
        res,
        'x-wildcard-asset-target'
      )

      if (wildcardAssetTarget) {
        req.url = wildcardAssetTarget
          .replace(join(state.get('assetsPath'), mwPath), '')
      }

      return serveStatic(fsPath, { redirect: false })(req, res, next)
    })

    logger.info(
      `-> STATIC ASSETS   ${wildcardPath || mwPath || '/'} => ${fsPath}`
    )
  })
}

const createProxies = ({ app, router, proxies }) => {
  if (!proxies) {
    return
  }

  proxies.forEach(({ path, context, def }) => {
    const proxyMw = createProxyMiddleware({ ...context, logLevel: 'warn' })

    if (Object.keys(def.throttle || {}).length) {
      app.use(path || '/', getThrottleMiddleware(def))
    }

    app.use(path || '/',
      async (req, res) => {
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

          setResponseHeader(res, 'x-proxied', true)
          return proxyMw(req, res, next)
        })
      }
    )

    logger.info(`-> PROXY   ${path || '/'} => ${context.target}`)
  })
}

export { createRoutes }
