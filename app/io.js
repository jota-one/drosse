const fs = require('fs')
const path = require('path')
const { isEmpty } = require('lodash')
const { v4: uuidv4 } = require('uuid')
const { replaceExpress } = require('@jota-one/replacer')
const useState = require('./use/state')
const state = useState()

const checkRootFile = () => {
  const getRootFile = ext => path.join(
    state.get('root'), `${state.get('routesFile')}.${ext}`
  )

  return fs.existsSync(getRootFile('js')) || fs.existsSync(getRootFile('json'))
}

const loadRcFile = () => {
  const rcFile = path.join(state.get('root'), '.drosserc.js')

  if (fs.existsSync(rcFile) || fs.existsSync(rcFile)) {
    const userConfig = require(rcFile)
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
    return function (api) {
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

const loadUuid = () => {
  const uuidFile = path.join(state.get('root'), '.uuid')

  if (!fs.existsSync(uuidFile)) {
    fs.writeFileSync(uuidFile, uuidv4(), 'utf8')
  }

  state.merge({ uuid: fs.readFileSync(uuidFile, 'utf8') })
}

const routes = () => require(
  path.join(state.get('root'), state.get('routesFile'))
)

module.exports = {
  checkRootFile,
  loadRcFile,
  loadService,
  loadStatic,
  loadUuid,
  routes
}
