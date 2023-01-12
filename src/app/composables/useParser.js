import useState from './useState'

const state = useState()

const parse = async ({ routes, root = [], hierarchy = [], onRouteDef }) => {
  let inherited = []
  const localHierarchy = [].concat(hierarchy)

  if (routes.DROSSE) {
    localHierarchy.push({ ...routes.DROSSE, path: root })
  }

  const orderedRoutes = Object.entries(routes)
    .filter(([path]) => path !== 'DROSSE')

  for (const orderedRoute of orderedRoutes) {
    const [path, content] = orderedRoute
    const fullPath = `/${root.join('/')}`

    if (Object.values(state.get('reservedRoutes')).includes(fullPath)) {
      throw new Error(`Route "${fullPath}" is reserved`)
    }

    const parsed = await parse({
      routes: content,
      root: root.concat(path),
      hierarchy: localHierarchy,
      onRouteDef,
    })

    inherited = inherited.concat(parsed)
  }

  if (routes.DROSSE) {
    const routeDef = await onRouteDef(routes.DROSSE, root, localHierarchy)
    inherited = inherited.concat(routeDef)
  }

  return inherited
}

export default function useParser() {
  return { parse }
}
