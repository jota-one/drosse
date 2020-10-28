const proxy = require('http-proxy-middleware')
const logger = require('./logger')
const useParser = require('./use/parser')
const useTemplates = require('./use/templates')
const { loadService, loadStatic } = require('./io')
const { isEmpty } = require('lodash')

const { parse } = useParser()
const templates = useTemplates()

const getThrottle = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

const setRoute = function (app, def, verb, root) {
  app[verb](
    '/' + root.join('/'),
    (req, res, next) => {
      if (!def.throttle) {
        return next()
      }
      setTimeout(next, getThrottle(def.throttle.min, def.throttle.max))
    },
    (req, res, next) => {
      let response

      if (def.service) {
        const api = require('./api')(req, res)
        const service = loadService(root, verb)
        response = service(api)
      }

      if (def.static) {
        response = loadStatic(root, req.params, verb)
      }

      if (def.body) {
        response = def.body
      }

      if (def.template && Object.keys(def.template).length) {
        response = templates.list()[def.template](response)
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
      const originalTemplate = Boolean(def[verb].template)
      def[verb].template =
        def[verb].template ||
        defHierarchy.reduce((acc, item) => item.template || acc, {})

      if (!originalTemplate && def[verb].template) {
        inheritance.push({ path: root.join('/'), type: 'template', verb })
      }

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
      context: { target: def.proxy, changeOrigin: true, onProxyReq: restream },
    })
  }

  return inheritance
}

const createRoutes = (app, routes) => {
  app.proxies = []
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
