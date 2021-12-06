const ws = require('ws')

module.exports = {
  onHttpUpgrade: (request, socket, head) => {
    const wss = new ws.Server({ noServer: true })

    wss.on('connection', function connection(ws) {
      ws.on('message', function message(data) {
        ws.send(`received: ${data}`)
      })

      ws.send('connected!')
    })

    wss.handleUpgrade(request, socket, head, function (connection) {
      wss.emit('connection', connection, request)
    })
  },
}
