const vorpal = require('@moleculer/vorpal')()
const cli = require('../commands')

module.exports = function (config, app, forked) {
  const runCommand = async (name, params, commandExecutionTimeout = 5000) => {
    return new Promise((resolve, reject) => {
      const sendResponse = ({ event, data }) => {
        if (event === 'cmdDone') {
          app.off('message', sendResponse)
          resolve(data)
        }
      }
      app.on('message', sendResponse)
      forked.send({ event: 'cmd', data: { name, params } })

      setTimeout(() => {
        app.off('message', sendResponse)
        reject(new Error('Request timeout'))
      }, commandExecutionTimeout)
    })
  }
  return {
    extend(callback) {
      callback(vorpal, { config, runCommand })
    },

    start() {
      this.extend(cli)
      vorpal.delimiter('📣$').show()
    },
  }
}
