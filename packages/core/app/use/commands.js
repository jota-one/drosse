const vorpal = require('@moleculer/vorpal')()

vorpal
  .command('addNode <parent> <name>', 'Add a node to drosse routes')
  .action(function (args, cb) {
    console.log(args)
    cb()
  })

module.exports = function () {
  return {
    extend(callback) {
      const state = require('./state')()
      callback(vorpal, state.get())
    },

    start() {
      vorpal.delimiter('📣$').show()
    },
  }
}
