const chalk = require('chalk')
const logger = require('../logger')

module.exports = (req, res, next) => {
  logger.debug(chalk.green(req.method.padEnd(7)), chalk.cyan(req.url))
  next()
}
