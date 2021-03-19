const vorpal = require('@moleculer/vorpal')()
const cli = require('../commands')

module.exports = function (config, app, forked) {
  const runSubProcessCommand = async (name, params) => {
    return new Promise((resolve, reject) => {
      app.on('message', ({ event, data }) => {
        if (event === 'cmdDone') {
          resolve(data)
        }
      })
      forked.send({ event: 'cmd', data: { name, params } })
    })
  }
  return {
    extend(callback) {
      callback(vorpal, { config, runSubProcessCommand })
    },

    start() {
      this.extend(cli)
      vorpal.delimiter('📣$').show()
    },
  }
}
