const db = require('./db')
module.exports = function (vorpal, state) {
  db(vorpal, state)

  vorpal
    .command('addNode <parent> <name>', 'Add a node to drosse routes')
    .action(function (args, cb) {
      console.log(args)
      cb()
    })
}
