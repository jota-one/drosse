const session = require('./middlewares/session')
const checkSession = require('./middlewares/check-session')

module.exports = {
  name: 'Example session',
  port: 8795,
  middlewares: { session, checkSession }
}
