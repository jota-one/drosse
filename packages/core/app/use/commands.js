const vorpal = require('@moleculer/vorpal')()
const commands = require('../commands')

module.exports = function () {
  return {
    extend(callback) {
      const state = require('./state')()
      const db = require('./db')()
      callback(vorpal, { config: state.get(), db })
    },

    start() {
      this.extend(commands)
      vorpal.delimiter('📣$').show()
    },
  }
}
