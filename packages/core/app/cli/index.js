const db = require('./db')

module.exports = function (vorpal, params) {
  const exitCmd = vorpal.find('exit')

  if (exitCmd) {
    exitCmd.remove()
  }

  vorpal.command('exit', 'Exit application.').action(() => {
    params.app.kill('SIGINT')
    process.exit()
  })

  vorpal.command('rs', 'Restart the server.').action(async () => {
    return params.restart()
  })

  db(vorpal, params)
}
