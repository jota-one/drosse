const useState = require('./state')
const state = useState()

const parse = ({ routes, root = [], onRouteDef }) => {
  Object.entries(routes)
    .filter(([path]) => path !== 'DROSSE')
    .sort((a, b) => {
      return a[0] > b[0] || !a[0].indexOf(':') ? 1 : -1
    })
    .map(([path, content]) => {
      const fullPath = `/${root.join('/')}`
      if (Object.values(state.get('reservedRoutes')).includes(fullPath)) {
        throw new Error(`Route "${fullPath}" is reserved`)
      }

      if (path !== 'DROSSE') {
        parse({ routes: content, root: root.concat(path), onRouteDef })
      }
    })

  if (routes.DROSSE) {
    onRouteDef(routes.DROSSE, root)
  }
}

module.exports = function useParser () {
  return { parse }
}
