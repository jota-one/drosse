const { onHttpUpgrade } = require('./ws')

module.exports = {
  name: 'Websocket example',
  onHttpUpgrade
}