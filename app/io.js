const fs = require('fs')
const path = require('path')
const { isEmpty } = require('lodash')
const { resolveExpress } = require('./strings')
const useState = require('./use/useState')
const state = useState()

const checkRootFile = () => {
  return fs.existsSync(path.join(state.get('root'), state.get('routesFile') + '.js')) || fs.existsSync(path.join(state.get('root'), state.get('routesFile') + '.json'))
}

const loadRcFile = () => {
  if (fs.existsSync(path.join(state.get('root'), '.drosserc.js')) || fs.existsSync(path.join(state.get('root'), '.drosserc'))) {
    const userConfig = require(path.join(state.get('root'), '.drosserc'))
    state.merge(userConfig)
  }
}

const loadService = (routePath) => {
  const serviceFile = path.join(state.get('root'), state.get('servicesPath'), routePath.filter(el => el[0] !== ':').join('.'))
  if (!fs.existsSync(serviceFile + '.js')) {
    return function (api) { console.log(`service [${serviceFile}.js] not found`) }
  }
  return require(serviceFile)
}

const loadStatic = (routePath, params = {}, verb = null) => {
  const staticFile = resolveExpress(path.join(
    state.get('root'),
    state.get('staticPath'),
    routePath.join('.').concat((verb ? `.${verb}` : ''))
  ), params)

  if (!fs.existsSync(staticFile + '.json')) {
    if (verb) {
      return loadStatic(routePath, params)
    }
    if (!isEmpty(params)) {
      return loadStatic(routePath)
    }
    return { drosse: `file [${staticFile}.json] not found.` }
  }
  return require(staticFile)
}

const routes = () => require(path.join(state.get('root'), state.get('routesFile')))

module.exports = {
  checkRootFile,
  loadRcFile,
  loadService,
  loadStatic,
  routes
}
