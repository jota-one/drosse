import { fromNodeMiddleware } from 'h3'
import ansiColors from 'ansi-colors'
import morgan, { token } from 'morgan'
import { getResponseHeader } from 'h3'

import useState from '../composables/useState'

const state = useState()

token('time', function getTime() {
  return ansiColors.gray(new Date().toLocaleTimeString())
})

token('status', function (req, res) {
  const col = color(res.statusCode)
  return ansiColors[col](res.statusCode)
})

token('method', function (req, res) {
  const verb = req.method.padEnd(7)
  const col = color(res.statusCode)
  return ansiColors[col](verb)
})

token('url', function (req, res) {
  const url = req.originalUrl || req.url
  return getResponseHeader(res, 'x-proxied')
    ? ansiColors.cyan(url)
    : ansiColors[color(res.statusCode)](url)
})

token('proxied', function (req, res) {
  return getResponseHeader(res, 'x-proxied')
    ? ansiColors.cyanBright('🔀 proxied')
    : ''
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

export default fromNodeMiddleware(
  morgan(format, {
    skip: req => Object.values(state.get('reservedRoutes')).includes(req.url),
  })
)
