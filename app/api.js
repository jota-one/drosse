const logger = require('./logger')
const useDb = require('./use/db')
const db = useDb()
const { loadStatic } = require('./io')

module.exports = function (req, res) {
  return {
    req,
    res,
    db,
    logger,
    io: { loadStatic }
  }
}
