const logger = require('./logger')
const useDb = require('./use/db')
const useState = require('./use/state')
const useIo = require('./use/io')
const db = useDb()
const state = useState()
const { loadStatic, loadScraped } = useIo()

module.exports = function (req, res) {
  return {
    req,
    res,
    db,
    logger,
    io: { loadStatic, loadScraped },
    config: state.get(),
  }
}
