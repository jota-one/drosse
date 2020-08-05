import useParser from '@jota-one/drosse/app/use/parser'

const VERBS = ['get', 'post', 'put', 'patch', 'delete']

const isVerb = type => VERBS.includes(type.toLowerCase())

export default function useRoutes () {
  const getRoutes = (drosseConfig, savedRoutes) => {
    const { parse } = useParser()
    const routes = []

    const onRouteDef = (def, root) => {
      const paths = root

      const global = Object.entries(def)
        .filter(([ type ]) => !isVerb(type))
        .map(([ type, handler ]) => ({ type, handler }))[0]

      const verbs = Object.entries(def)
        .filter(([ type ]) => isVerb(type))
        .map(([ type, handler ]) => ({ type, handler }))
        .sort()


      routes.push({ paths, verbs, global })
    }

    parse({ routes: drosseConfig.routes, onRouteDef })

    return routes.reverse()
      .reduce((routes, route, i) => {
        let level = 0
        let fullPath = ''
        let savedRoute

        if (!route.paths.length) {
          savedRoute = savedRoutes.find(r => r.fullPath === '/')
          routes.push({
            level, path: '/',
            fullPath: '/',
            opened: savedRoute?.opened
          })
        }

        for (const path of route.paths) {
          level++
          fullPath += `/${path}`

          savedRoute = savedRoutes.find(r => r.fullPath === fullPath)

          if (!routes.find(r => r.fullPath === fullPath)) {
            routes.push({
              level,
              pos: i + 1,
              path: `/${path}`,
              fullPath,
              virtual: true,
              opened: savedRoute?.opened
            })
          }
        }

        const realRoute = routes[routes.length - 1]

        realRoute.virtual = false
        realRoute.verbs = route.verbs
        realRoute.global = route.global
        realRoute.selected = realRoute.global
          ? 'global'
          : realRoute.verbs[0]?.type

        return routes
      }, [])
  }

  return { getRoutes }
}
