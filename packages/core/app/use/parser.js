const useState = require('./state')
const state = useState()

const parse = ({ routes, root = [], hierarchy = [], onRouteDef }) => {
  let inherited = []
  const localHierarchy = [].concat(hierarchy)
  if (routes.DROSSE) {
    localHierarchy.push({ ...routes.DROSSE, path: root })
  }
  Object.entries(routes)
    .filter(([path]) => path !== 'DROSSE')
    .sort((a, b) => {
      return a[0].indexOf(':') === 0 ? 1 : a[0] > b[0] ? -1 : 0
    })
    .map(([path, content]) => {
      const fullPath = `/${root.join('/')}`
      if (Object.values(state.get('reservedRoutes')).includes(fullPath)) {
        throw new Error(`Route "${fullPath}" is reserved`)
      }

      inherited = inherited.concat(
        parse({
          routes: content,
          root: root.concat(path),
          hierarchy: localHierarchy,
          onRouteDef,
        })
      )
    })

  if (routes.DROSSE) {
    inherited = inherited.concat(
      onRouteDef(routes.DROSSE, root, localHierarchy)
    )
  }

  return inherited
}

module.exports = function useParser() {
  return { parse }
}
