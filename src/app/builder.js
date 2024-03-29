import { join } from 'path'

import {
  getQuery,
  getResponseHeader,
  getRouterParams,
  send,
  setResponseHeader,
  eventHandler,
  fromNodeMiddleware,
} from 'h3'
import {
  createProxyMiddleware,
  responseInterceptor,
} from 'http-proxy-middleware'
import serveStatic from 'serve-static'

import config from './config'
import { isEmpty } from '../helpers'
import logger from './logger'
import internalMiddlewares from './middlewares'

import useAPI from './composables/useAPI'
import useIO from './composables/useIO'
import useParser from './composables/useParser'
import useScraper from './composables/useScraper'
import useState from './composables/useState'
import useTemplates from './composables/useTemplates'
import { readFile } from 'fs/promises'

const { loadService, loadScraperService, loadStatic, loadScraped } = useIO()
const { parse } = useParser()
const state = useState()
const templates = useTemplates()

const getThrottle = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

const throttle = def =>
  new Promise(resolve => {
    const delay = getThrottle(
      def.throttle.min || 0,
      def.throttle.max || def.throttle.min
    )
    logger.info(`${config.icons.plugin.throttle} throttling [${delay} ms]...`)
    setTimeout(resolve, delay)
  })

const getProxy = function (def) {
  return typeof def.proxy === 'string' ? { target: def.proxy } : def.proxy
}

const createRoutes = async (app, router, routes) => {
  const context = { app, router, proxies: [], assets: [] }
  const inherited = await parse({
    routes,
    onRouteDef: await createRoute.bind(context),
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
    const inheritsProxy = Boolean(
      defHierarchy.find(item => root.join('/').includes(item.path.join('/')))
        ?.proxy
    )

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
        } catch (e) {
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

  const handlerType = def.service ? 'service' : def.static ? 'static' : 'body'

  const handlerPlugins = Object.entries(def).reduce((list, [k, v]) => {
    if (k === 'template') {
      list.push('template')
    }

    if (k === 'throttle' && Object.keys(v).length) {
      list.push('throttle')
    }

    if (k === 'proxy') {
      list.push('proxy')
    }

    return list
  }, [])

  const handler = async event => {
    let response
    let applyTemplate = true
    let staticExtension = 'json'

    setResponseHeader(event, 'x-drosse-handler-type', handlerType)
    setResponseHeader(
      event,
      'x-drosse-handler-plugins',
      handlerPlugins.join(',')
    )

    if (Object.keys(def.throttle).length) {
      await throttle(def)
    }

    if (def.service) {
      const api = useAPI(event)
      const { serviceFile, service } = await loadService(root, verb)
      try {
        response = await service(api)
      } catch (e) {
        console.log('Error in service', serviceFile, e)
        throw e
      }
    }

    if (def.static) {
      try {
        const params = getRouterParams(event)
        const query = getQuery(event)
        const { extensions } = def
        const [result, extension] = await loadStatic({
          routePath: root,
          params,
          verb,
          query,
          extensions,
        })
        response = result
        staticExtension = extension
        if (!response) {
          const [result, extension] = await loadScraped({
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
          stack: e.stack,
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
      // send file
      const content = await readFile(response)
      send(event, content, 'application/octet-stream')
    }

    return response
  }

  if (inheritsProxy) {
    // We defined a middleware for the route so that if overwrites the proxy middleware
    app.use(path, eventHandler(handler), { match: url => url === '/' })
  } else {
    router[verb](path, eventHandler(handler))
  }

  const summary = {
    verb: verb.toUpperCase().padEnd(7),
    route: `${state.get('basePath')}/${root.join('/')}`,
    handler: config.icons.handler[handlerType],
    plugins: handlerPlugins
      .map(plugin => config.icons.plugin[plugin])
      .join(' '),
  }

  logger.success(
    `-> ${summary.verb} ${summary.handler} ${summary.route} ${summary.plugins}`
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

      app.use(
        mwPath,
        eventHandler(event => {
          if (re.test(`${mwPath}${event.node.req.url}`)) {
            setResponseHeader(event, 'x-wildcard-asset-target', context.target)
          }
        })
      )

      _assets.push({ mwPath, fsPath, wildcardPath: routePath })
    } else {
      _assets.push({ mwPath, fsPath })
    }
  })

  _assets.forEach(({ mwPath, fsPath, wildcardPath }) => {
    app.use(
      mwPath,
      eventHandler(async event => {
        const wildcardAssetTarget = getResponseHeader(
          event,
          'x-wildcard-asset-target'
        )

        if (wildcardAssetTarget) {
          event.node.req.url = wildcardAssetTarget.replace(
            join(state.get('assetsPath'), mwPath),
            ''
          )
        }

        return fromNodeMiddleware(serveStatic(fsPath))(event)
      })
    )

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
      app.use(
        path || '/',
        eventHandler(async () => await throttle(def))
      )
    }

    app.use(
      path || '/',
      eventHandler(event => {
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

          setResponseHeader(event, 'x-proxied', true)
          return proxyMw(event.node.req, event.node.res, next)
        })
      })
    )

    logger.info(`-> PROXY   ${path || '/'} => ${context.target}`)
  })
}

export { createRoutes }
