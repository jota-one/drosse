const { configureExpress } = require('./ws')

module.exports = {
  name: 'SockJS example',
  port: 8119,
  middlewares: ['open-cors'],
  configureExpress
}