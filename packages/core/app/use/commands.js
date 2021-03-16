const vorpal = require('@moleculer/vorpal')()
const commands = require('../commands')

module.exports = function (config) {
  return {
    extend(callback) {
      // const state = require('./state')()
      // const db = require('./db')()
      callback(vorpal, { config })
    },

    start() {
      this.extend(commands)
      vorpal.delimiter('📣$').show()
    },
  }
}
