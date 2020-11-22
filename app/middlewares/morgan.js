const morgan = require('morgan')
const c = require('ansi-colors')
const useState = require('../use/state')
const state = useState()

morgan.token('time', function getTime() {
  return c.gray(new Date().toLocaleTimeString())
})

morgan.token('status', function (req, res) {
  const col = color(res.statusCode)
  return c[col](res.statusCode)
})

morgan.token('method', function (req, res) {
  const verb = req.method.padEnd(7)
  const col = color(res.statusCode)
  return c[col](verb)
})

morgan.token('url', function (req, res) {
  const url = req.originalUrl || req.url
  return res.get('x-proxied') ? c.cyan(url) : c[color(res.statusCode)](url)
})

morgan.token('proxied', function (req, res) {
  return res.get('x-proxied') ? c.cyanBright('🏓 proxied') : ''
})

const color = status => {
  if (status >= 400) {
    return 'red'
  }
  if (status >= 300) {
    return 'yellow'
  }
  return 'green'
}

const format = function (tokens, req, res) {
  return [
    tokens.time(req, res),
    tokens.method(req, res),
    tokens.status(req, res),
    '-',
    tokens['response-time'](req, res, 0)
      ? tokens['response-time'](req, res, 0).concat('ms').padEnd(7)
      : '🚫',
    tokens.url(req, res),
    tokens.proxied(req, res),
  ].join(' ')
}

module.exports = morgan(format, {
  skip: (req, res) =>
    Object.values(state.get('reservedRoutes')).includes(req.url),
})
