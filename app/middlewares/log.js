const chalk = require('chalk')
const logger = require('../logger')
const useState = require('../use/state')
const state = useState()

module.exports = (req, res, next) => {
  if (!Object.values(state.get('reservedRoutes')).includes(req.url)) {
    logger.debug(chalk.green(req.method.padEnd(7)), chalk.cyan(req.url))
  }
  next()
}
