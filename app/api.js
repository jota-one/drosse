const useDb = require('./use/db')
const db = useDb()

module.exports = function (req) {
  return {
    req,
    db
  }
}
