import { get } from '../../helpers'

import config from '../config'

let state = config.commands

export default function useCommand() {
  return {
    merge(commands) {
      state = { ...state, ...commands }
    },

    executeCommand(command) {
      return get(state, command.name)(command.params)
    },
  }
}
