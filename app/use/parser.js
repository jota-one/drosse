const useState = require('./state')
const state = useState()

const parse = ({ routes, root = [], hierarchy = [], onRouteDef }) => {
  const localHierarchy = [].concat(hierarchy)
  if (routes.DROSSE) {
    localHierarchy.push(routes.DROSSE)
  }
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

      parse({
        routes: content,
        root: root.concat(path),
        hierarchy: localHierarchy,
        onRouteDef,
      })
    })

  if (routes.DROSSE) {
    onRouteDef(routes.DROSSE, root, localHierarchy)
  }
}

module.exports = function useParser () {
  return { parse }
}
