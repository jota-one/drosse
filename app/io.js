const fs = require('fs')
const path = require('path')
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

const routes = () => require(path.join(state.get('root'), state.get('routesFile')))

module.exports = {
  checkRootFile,
  loadRcFile,
  loadService,
  routes
}
