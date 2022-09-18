const sockjs = require('sockjs')

const PREFIX = '/echo'

module.exports = {
  extendServer({ server, db }) {
    const sockJsServer = sockjs.createServer()

    sockJsServer.on('connection', conn => {
      conn.on('data', message => {
        db.insert('messages', [Date.now()], { message })
        conn.write(`echo: ${message}`)
      })
    })

    sockJsServer.installHandlers(server, { prefix: PREFIX })
  }
}