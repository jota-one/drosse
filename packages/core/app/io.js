const fs = require('fs')
const path = require('path')
const rrdir = require('rrdir')
const { isEmpty } = require('lodash')
const { v4: uuidv4 } = require('uuid')
const { replace } = require('@jota-one/replacer')
const useState = require('./use/state')
const useMiddleware = require('./use/middlewares')
const useTemplates = require('./use/templates')
const useCommands = require('./use/commands')
const logger = require('./logger')
const state = useState()
const middlewares = useMiddleware()
const templates = useTemplates()

const checkRoutesFile = () => {
  const filePath = path.join(
    state.get('root'),
    `${state.get('routesFile')}.json`
  )
  if (fs.existsSync(filePath)) {
    state.set('_routesFile', filePath)
    return true
  }
  return false
}

const loadRcFile = () => {
  templates.set([])
  const rcFile = path.join(state.get('root'), '.drosserc.js')

  if (fs.existsSync(rcFile)) {
    const userConfig = require(rcFile)

    if (userConfig.commands) {
      useCommands().extend(userConfig.commands)
    }

    if (userConfig.middlewares) {
      middlewares.append(userConfig.middlewares)
    }

    if (userConfig.templates) {
      templates.add(userConfig.templates)
    }

    state.merge(userConfig)
  }
}

const loadService = (routePath, verb) => {
  const serviceFile =
    path.join(
      state.get('root'),
      state.get('servicesPath'),
      routePath.filter(el => el[0] !== ':').join('.')
    ) + `.${verb}.js`

  if (!fs.existsSync(serviceFile)) {
    return function () {
      logger.error(`service [${serviceFile}] not found`)
    }
  }

  return require(serviceFile)
}
const loadHooverService = routePath => {
  const serviceFile =
    path.join(
      state.get('root'),
      state.get('hooverServicesPath'),
      routePath.filter(el => el[0] !== ':').join('.')
    ) + '.js'

  if (!fs.existsSync(serviceFile)) {
    return function () {
      logger.error(`hoover service [${serviceFile}] not found`)
    }
  }

  return require(serviceFile)
}

const findStatic = (
  root,
  files,
  routePath,
  params = {},
  verb = null,
  skipVerb = false
) => {
  const comparePath = filePath => filePath.replace(root, '').substr(1)

  let staticFile = replace(
    path.join(
      state.get('root'),
      state.get('staticPath'),
      routePath
        .join('.')
        .concat(verb && !skipVerb ? `.${verb}` : '')
        .replace(/:([^\\/\\.]+)/gim, '{$1}')
    ),
    params
  )
  staticFile = staticFile.concat(
    staticFile.slice(-5) === '.json' ? '' : '.json'
  )

  const foundFiles = files.filter(
    file =>
      comparePath(file.path).replace(/\//gim, '.') === comparePath(staticFile)
  )

  if (foundFiles.length > 1) {
    const error = `findStatic: more than 1 file found for:\n[${staticFile}]:\n${foundFiles
      .map(f => f.path)
      .join('\n')}`

    logger.error(error)
    return { drosse: error }
  }

  if (foundFiles.length === 1) {
    staticFile = foundFiles[0].path
    logger.info(`findStatic: file used: ${staticFile}`)
  }

  if (foundFiles.length === 0) {
    logger.error(`findStatic: tried with [${staticFile}]. File not found.`)

    if (verb && !skipVerb) {
      return findStatic(root, files, routePath, params, verb, true)
    }

    // retry by removing the first param of the list
    if (!isEmpty(params)) {
      logger.error(`findStatic: tried with [${staticFile}]. File not found.`)
      const newParams = Object.keys(params)
        .slice(1)
        .reduce((acc, name) => ({ ...acc, [name]: params[name] }), {})
      return findStatic(root, files, routePath, newParams, verb)
    }
    return { drosse: `file [${staticFile}] not found.` }
  }

  return require(staticFile)
}

const loadStatic = (routePath, params = {}, verb = null, skipVerb = false) => {
  const root = path.join(state.get('root'), state.get('staticPath'))
  const files = rrdir.sync(root)
  return findStatic(root, files, routePath, params, verb, skipVerb)
}

const loadUuid = () => {
  const uuidFile = path.join(state.get('root'), '.uuid')

  if (!fs.existsSync(uuidFile)) {
    fs.writeFileSync(uuidFile, uuidv4(), 'utf8')
  }

  state.merge({ uuid: fs.readFileSync(uuidFile, 'utf8') })
}

const routes = () => {
  const content = fs.readFileSync(state.get('_routesFile'), 'utf8')
  return JSON.parse(content)
}

module.exports = {
  checkRoutesFile,
  loadRcFile,
  loadService,
  loadStatic,
  loadUuid,
  routes,
}
