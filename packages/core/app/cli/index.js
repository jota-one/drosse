const db = require('./db')
module.exports = function (vorpal, params) {
  vorpal.command('rs', 'Restart the server').action(async () => {
    return params.restart()
  })

  db(vorpal, params)
}
