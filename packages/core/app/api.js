const logger = require('./logger')
const useDb = require('./use/db')
const useState = require('./use/state')
const db = useDb()
const state = useState()
const { loadStatic } = require('./io')

module.exports = function (req, res) {
  return {
    req,
    res,
    db,
    logger,
    io: { loadStatic },
    config: state.get(),
  }
}
