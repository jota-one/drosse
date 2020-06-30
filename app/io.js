const fs = require('fs')
const path = require('path')

// global scope
const scope = {
  routesFile: 'routes',
  root: ''
}

const checkRootFile = () => {
  return fs.existsSync(path.join(scope.root, scope.routesFile + '.js')) || fs.existsSync(path.join(scope.root, scope.routesFile + '.json'))
}
const setScope = (key, value) => {
  scope[key] = value
}
const getScope = key => {
  if (key) {
    return scope[key]
  }
  return scope
}
const routes = () => require(path.join(scope.root, scope.routesFile))

module.exports = {
  setScope,
  checkRootFile,
  getScope,
  routes
}
