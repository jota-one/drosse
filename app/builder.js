const proxy = require('http-proxy-middleware')
const useParser = require('./use/parser')
const { loadService, loadStatic } = require('./io')

const { parse } = useParser()
let proxies

const setRoute = function (app, def, verb, root) {
  app.get('/' + root.join('/'), (req, res, next) => {
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
  console.log(`created a ${verb.toUpperCase()} route`, '/' + root.join('/'))
}

const createRoute = function (def, root) {
  proxies = []
  const app = this

  ;['get', 'post', 'put', 'delete']
    .filter(verb => def[verb])
    .forEach(verb => setRoute(app, def[verb], verb, root))

  if (def.proxy) {
    const path = [''].concat(root)
    proxies.push({
      path: path.join('/'),
      context: { target: def.proxy, changeOrigin: true, onProxyReq: restream }
    })
  }
}

const createRoutes = (app, routes) => {
  parse({ routes, onRouteDef: createRoute.bind(app) })
  createProxies(app)
}

const restream = function (proxyReq, req) {
  if (req.body) {
    const bodyData = JSON.stringify(req.body)
    // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
    proxyReq.setHeader('Content-Type', 'application/json')
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
    // stream the content
    proxyReq.write(bodyData)
  }
}

const createProxies = app => {
  proxies.forEach(({ path, context }) => {
    app.use(path || '/', proxy.createProxyMiddleware(context))
    console.log(`proxy queries on ${path || '/'} to ${context.target}`)
  })
}

module.exports = { createRoutes }
