const fs = require('fs')
const path = require('path')
const { isEmpty } = require('lodash')
const { v4: uuidv4 } = require('uuid')
const { replaceExpress } = require('@jota-one/replacer')
const useState = require('./use/state')
const useMiddleware = require('./use/middlewares')
const state = useState()
const middlewares = useMiddleware()

const checkRoutesFile = () => {
  const getRoutesFile = ext => path.join(
    state.get('root'), `${state.get('routesFile')}.${ext}`
  )

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
  const rcFile = path.join(state.get('root'), '.drosserc.js')

  if (fs.existsSync(rcFile) || fs.existsSync(rcFile)) {
    const userConfig = require(rcFile)
    if (userConfig.middlewares) {
      middlewares.append(userConfig.middlewares)
    }
    state.merge(userConfig)
  }
}

const loadService = (routePath, verb) => {
  const serviceFile = path.join(
    state.get('root'),
    state.get('servicesPath'),
    routePath.filter(el => el[0] !== ':').join('.')
  ) + `.${verb}.js`

  if (!fs.existsSync(serviceFile)) {
    return function () {
      console.log(`service [${serviceFile}] not found`)
    }
  }

  return require(serviceFile)
}

const loadStatic = (routePath, params = {}, verb = null) => {
  const staticFile = replaceExpress(path.join(
    state.get('root'),
    state.get('staticPath'),
    routePath.join('.').concat((verb ? `.${verb}` : ''))
  ), params)

  if (!fs.existsSync(staticFile + '.json')) {
    console.log(`loadStatic: tried with [${staticFile}]. File not found.`)
    if (verb) {
      return loadStatic(routePath, params)
    }
    if (!isEmpty(params)) {
      console.log(`loadStatic: tried with [${staticFile}]. File not found.`)
      return loadStatic(routePath)
    }
    return { drosse: `file [${staticFile}.json] not found.` }
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
  routes
}
