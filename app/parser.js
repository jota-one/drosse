const proxy = require('http-proxy-middleware')
const { loadService, loadStatic } = require('./io')
const proxies = []
const parse = (app, routes, root = []) => {
  Object.entries(routes)
    .filter(([path]) => path !== 'DROSSE')
    .sort((a, b) => {
      return a[0] > b[0] || !a[0].indexOf(':') ? 1 : -1
    })
    .map(([path, content]) => {
      if (path !== 'DROSSE') {
        parse(app, content, root.concat(path))
      }
    })

  if (routes.DROSSE) {
    const d = routes.DROSSE
    if (d.get) {
      app.get('/' + root.join('/'), (req, res, next) => {
        if (d.get.service) {
          const api = require('./api')(req)
          const service = loadService(root)
          return res.send(service(api))
        }
        if (d.get.static) {
          const file = loadStatic(root, req.params, 'get')
          return res.send(file)
        }
        res.send(d.get.body)
      })
      console.log('created a GET route', '/' + root.join('/'))
    }
    if (d.post) {
      app.post('/' + root.join('/'), (req, res, next) => {
        if (d.post.static) {
          const file = loadStatic(root, req.params, 'post')
          return res.send(file)
        }
        res.send(d.post.body)
      })
      console.log('created a POST route', '/' + root.join('/'))
    }
    if (d.proxy) {
      const path = [''].concat(root)
      proxies.push({
        path: path.join('/'),
        context: { target: d.proxy, changeOrigin: true, onProxyReq: restream }
      })
    }
  }
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

module.exports = {
  parse,
  createProxies
}
