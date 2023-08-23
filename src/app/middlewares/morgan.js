import { fromNodeMiddleware } from 'h3'
import ansiColors from 'ansi-colors'
import morgan, { token } from 'morgan'

import config from '../config'
import useState from '../composables/useState'

const state = useState()

token('time', function getTime() {
  return ansiColors.gray(new Date().toLocaleTimeString())
})

token('status', function (req, res) {
  const col = color(res.statusCode, req.method)
  return ansiColors[col](res.statusCode)
})

token('method', function (req, res) {
  const verb = req.method.padEnd(7)
  const col = color(res.statusCode, req.method)
  return ansiColors[col](verb)
})

token('handler', function (req, res) {
  const handlerType = res.getHeader('x-drosse-handler-type')
  return handlerType ? config.icons.handler[handlerType] : '  '
})

token('url', function (req, res) {
  const url = req.originalUrl || req.url
  return res.getHeader('x-proxied')
    ? ansiColors.cyan(url)
    : ansiColors[color(res.statusCode, req.method)](url)
})

token('plugins', function (req, res) {
  const plugins = res.getHeader('x-drosse-handler-plugins')
  return plugins
    ? plugins
        .split(',')
        .map(plugin => config.icons.plugin[plugin])
        .join(' ')
    : ''
})

token('proxied', function (req, res) {
  return res.getHeader('x-proxied')
    ? ansiColors.cyanBright(`${config.icons.handler.proxy} proxied`)
    : ''
})

const color = (status, method) => {
  if (method === 'OPTIONS') {
    return 'greenBright'
  }

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
    tokens.handler(req, res),
    tokens.url(req, res),
    tokens.plugins(req, res),
    tokens.proxied(req, res),
  ].join(' ')
}

export default fromNodeMiddleware(
  morgan(format, {
    skip: req => Object.values(state.get('reservedRoutes')).includes(req.url),
  })
)
