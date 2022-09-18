import db from './db'

export default function (vorpal, params) {
  vorpal.command('rs', 'Restart the server.').action(() => {
    return params.restart()
  })

  db(vorpal, params)
}
