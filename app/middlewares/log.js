const c = require('ansi-colors')
const logger = require('../logger')
const useState = require('../use/state')
const state = useState()

module.exports = (req, res, next) => {
  if (!Object.values(state.get('reservedRoutes')).includes(req.url)) {
    logger.debug(c.green(req.method.padEnd(7)), c.cyan(req.url))
  }
  next()
}
