const session = require('./middlewares/session')

module.exports = {
  name: 'Example session',
  port: 8795,
  middlewares: ['open-cors', session, function(req, res, next) {
    if (req.url === '/auth' && req.method === 'POST') {
      return next()
    }

    if (!req.session.authenticated) {
      const msg = '<h2>You\'re not authenticated</h2><br>Call <pre style="display:inline">fetch("/auth", { method: "post" })</pre> in the browser\'s console to authenticate and <b>refresh this page</b>'
      return res.status(401).send(msg)
    }

    next()
  }]
}
