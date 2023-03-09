const session = require('./middlewares/session')
const {
  fromNodeMiddleware,
  eventHandler,
  getMethod,
  setResponseStatus,
} = require('h3')

module.exports = {
  name: 'Example session',
  port: 8795,
  middlewares: [
    'open-cors',
    fromNodeMiddleware(session),
    eventHandler(function (event) {
      if (event.node.req.url === '/auth' && getMethod(event) === 'POST') {
        return
      }

      if (!event.node.req.session.authenticated) {
        const msg =
          '<h2>You\'re not authenticated</h2><br>Run <pre style="display:inline">fetch("/auth", { method: "post" })</pre> in the browser\'s console to authenticate and <b>refresh this page</b>'
        setResponseStatus(event, 401)
        return msg
      }
    }),
  ],
}
