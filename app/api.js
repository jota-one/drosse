const logger = require('./logger')
const useDb = require('./use/db')
const db = useDb()

module.exports = function (req, res) {
  return {
    req,
    res,
    db,
    logger
  }
}
