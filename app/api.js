const useDb = require('./use/useDb')
const db = useDb()

module.exports = function (req) {
  return {
    req,
    db
  }
}
