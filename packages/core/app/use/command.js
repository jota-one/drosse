const get = require('lodash/get')
const config = require('../config')
let state = config.commands

module.exports = function useCommand() {
  return {
    merge(commands) {
      state = { ...state, ...commands }
    },

    executeCommand(command) {
      return get(state, command.name)(command.params)
    },
  }
}
