const fs = require('fs')
const path = require('path')
const { isEmpty } = require('lodash')
const { v4: uuidv4 } = require('uuid')
const { replaceExpress } = require('@jota-one/replacer')
const useState = require('./use/state')
const useMiddleware = require('./use/middlewares')
const useTemplates = require('./use/templates')
const logger = require('./logger')
const state = useState()
const middlewares = useMiddleware()
const templates = useTemplates()

const checkRoutesFile = () => {
  const getRoutesFile = ext =>
    path.join(state.get('root'), `${state.get('routesFile')}.${ext}`)

  const isJs = fs.existsSync(getRoutesFile('js'))
  const isJson = fs.existsSync(getRoutesFile('json'))

  if (isJs) {
    state.set('_routesFile', getRoutesFile('js'))
    return true
  } else if (isJson) {
    state.set('_routesFile', getRoutesFile('json'))
    return true
  } else {
    return false
  }
}

const loadRcFile = () => {
  templates.set([])
  const rcFile = path.join(state.get('root'), '.drosserc.js')

  if (fs.existsSync(rcFile) || fs.existsSync(rcFile)) {
    const userConfig = require(rcFile)

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

const loadStatic = (routePath, params = {}, verb = null, skipVerb = false) => {
  let staticFile = replaceExpress(
    path.join(
      state.get('root'),
      state.get('staticPath'),
      routePath.join('.').concat(verb && !skipVerb ? `.${verb}` : '')
    ),
    params
  )
  staticFile = staticFile.concat(
    staticFile.slice(-5) === '.json' ? '' : '.json'
  )

  if (!fs.existsSync(staticFile)) {
    logger.error(`loadStatic: tried with [${staticFile}]. File not found.`)

    if (verb && !skipVerb) {
      return loadStatic(routePath, params, verb, true)
    }

    // retry by removing the first param of the list
    if (!isEmpty(params)) {
      logger.error(`loadStatic: tried with [${staticFile}]. File not found.`)
      const newParams = Object.keys(params)
        .slice(1)
        .reduce((acc, name) => ({ ...acc, [name]: params[name] }), {})
      return loadStatic(routePath, newParams, verb)
    }
    return { drosse: `file [${staticFile}] not found.` }
  }
  return require(staticFile)
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
