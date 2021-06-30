const db = require('./db')
module.exports = function (vorpal, params) {
  db(vorpal, params)
}
