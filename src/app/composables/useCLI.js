import _vorpal from '@moleculer/vorpal'
import cli from '../cli'
import useCommand from './useCommand'

export default function (config, restart) {
  const vorpal = _vorpal()
  const { executeCommand } = useCommand()

  const runCommand = async (name, params) => executeCommand({ name, params })

  return {
    extend(callback) {
      callback(vorpal, { config, runCommand, restart })
    },

    start() {
      this.extend(cli)
      vorpal.delimiter('🎤').show()
    },
  }
}
