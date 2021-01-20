const vorpal = require('@moleculer/vorpal')()
const commands = require('../commands')

module.exports = function () {
  return {
    extend(callback) {
      const state = require('./state')()
      callback(vorpal, state.get())
    },

    start() {
      this.extend(commands)
      vorpal.delimiter('📣$').show()
    },
  }
}
