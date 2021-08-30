const db = require('./db')
module.exports = function (vorpal, params) {
  vorpal.command('rs', 'Restart the server').action(() => {
    params.restart()
  })

  db(vorpal, params)
}
