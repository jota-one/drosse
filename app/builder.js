const proxy = require('http-proxy-middleware')
const logger = require('./logger')
const useParser = require('./use/parser')
const { loadService, loadStatic } = require('./io')

const { parse } = useParser()

const getThrottle = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

const setRoute = function (app, def, verb, root) {
  app[verb]('/' + root.join('/'), (req, res, next) => {
    if (!def.throttle) {
      return next()
    }
    setTimeout(next, getThrottle(def.throttle.min, def.throttle.max))
  }, (req, res, next) => {
    if (def.service) {
      const api = require('./api')(req, res)
      const service = loadService(root, verb)
      return res.send(service(api))
    }
    if (def.static) {
      const file = loadStatic(root, req.params, verb)
      return res.send(file)
    }
    res.send(def.body)
  })

  logger.success(`-> ${verb.toUpperCase().padEnd(7)} /${root.join('/')}`)
}

const createRoute = function (def, root, defHierarchy) {
  const app = this

  ;['get', 'post', 'put', 'delete']
    .filter(verb => def[verb])
    .forEach(verb => {
      // set throttling
      def[verb].throttle = def[verb].throttle || defHierarchy.reduce((acc, item) => {
        return item.throttle || acc
      }, {})

      // create route
      setRoute(app, def[verb], verb, root)
    })

  if (def.proxy) {
    if (!this.proxies) {
      this.proxies = []
    }

    const path = [''].concat(root)

    this.proxies.push({
      path: path.join('/'),
      context: { target: def.proxy, changeOrigin: true, onProxyReq: restream }
    })
  }
}

const createRoutes = (app, routes) => {
  parse({ routes, onRouteDef: createRoute.bind(app) })
  createProxies(app)
  return true
}

const restream = function (proxyReq, req) {
  if (req.body) {
    const bodyData = JSON.stringify(req.body)
    // If content-type is application/x-www-form-urlencoded -> we need to change to application/json
    proxyReq.setHeader('Content-Type', 'application/json')
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
    // stream the content
    proxyReq.write(bodyData)
  }
}

const createProxies = app => {
  if (!app.proxies) {
    return
  }

  app.proxies.forEach(({ path, context }) => {
    app.use(
      path || '/',
      proxy.createProxyMiddleware({ ...context, logLevel: 'warn' })
    )

    logger.info(`-> PROXY   ${path || '/'} => ${context.target}`)
  })
}

module.exports = { createRoutes }
