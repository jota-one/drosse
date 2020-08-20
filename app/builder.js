const proxy = require('http-proxy-middleware')
const useParser = require('./use/parser')
const { loadService, loadStatic } = require('./io')

const { parse } = useParser()
const proxies = []

const createRoute = function (def, root) {
  const app = this

  if (def.get) {
    app.get('/' + root.join('/'), (req, res, next) => {
      if (def.get.service) {
        const api = require('./api')(req, res)
        const service = loadService(root, 'get')
        return res.send(service(api))
      }
      if (def.get.static) {
        const file = loadStatic(root, req.params, 'get')
        return res.send(file)
      }
      res.send(def.get.body)
    })
    console.log('created a GET route', '/' + root.join('/'))
  }

  if (def.post) {
    app.post('/' + root.join('/'), (req, res, next) => {
      if (def.post.service) {
        const api = require('./api')(req, res)
        const service = loadService(root, 'post')
        return res.send(service(api))
      }
      if (def.post.static) {
        const file = loadStatic(root, req.params, 'post')
        return res.send(file)
      }
      res.send(def.post.body)
    })
    console.log('created a POST route', '/' + root.join('/'))
  }

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
