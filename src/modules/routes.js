import useParser from '@jota-one/drosse/app/use/parser'

const VERBS = ['delete', 'get', 'patch', 'post', 'put']
const HANDLERS = ['body', 'proxy', 'service', 'static']

const isVerb = type => VERBS.includes(type.toLowerCase())
const isHandler = type => HANDLERS.includes(type.toLowerCase())

const handleDetail = (detail, { type, handler }) => {
  if (type === 'disabled') {
    detail.disabled = handler
  } else if (type === 'proxy') {
    detail.type = 'proxy'
    detail.handler = handler
  } else {
    detail[type] = handler
  }
  return detail
}

export default function useRoutes() {
  const getRoutes = (drosseConfig, savedRoutes = []) => {
    const { parse } = useParser()
    const routes = []

    const onRouteDef = (def, root) => {
      const paths = root
      const defEntries = Object.entries(def)

      const global = defEntries
        .filter(([type]) => !isVerb(type))
        .map(([type, handler]) => ({ type, handler }))
        .reduce(handleDetail, {})

      const verbs = defEntries
        .filter(([type]) => isVerb(type))
        .map(([type, verbDef]) => {
          const verbEntries = Object.entries(verbDef)

          const handler = verbEntries
            .filter(([type]) => isHandler(type))
            .reduce((handler, [type, value]) => {
              handler[type] = value
              return handler
            }, {})

          const middlewares = verbEntries
            .filter(([type]) => !isHandler(type))
            .map(([type, handler]) => ({ type, handler }))
            .reduce(handleDetail, {})

          return { type, handler, ...middlewares }
        })
        .sort()

      routes.push({ paths, verbs, global })
    }

    parse({ routes: drosseConfig.routes, onRouteDef })

    return routes
      .sort((a, b) => {
        const format = route => route.paths.join('/').replace(/:/g, 'z')
        const aFormatted = format(a)
        const bFormatted = format(b)
        return aFormatted < bFormatted
          ? -100
          : aFormatted > bFormatted
          ? 100
          : 0 + (a.paths.length - b.paths.length)
      })
      .reduce((routes, route, i) => {
        let level = 0
        let fullPath = ''
        let savedRoute

        if (!route.paths.length) {
          savedRoute = savedRoutes.find(r => r.fullPath === '/')
          routes.push({
            level,
            path: '/',
            fullPath: '/',
            opened: savedRoute?.opened,
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
              opened: savedRoute?.opened,
            })
          }
        }

        const realRoute = routes[routes.length - 1]

        realRoute.virtual = false
        realRoute.verbs = route.verbs

        if (route.global && Object.keys(route.global).length) {
          realRoute.global = route.global
          realRoute.selected = 'global'
        } else {
          realRoute.selected = savedRoute?.selected || realRoute.verbs[0]?.type
        }

        return routes
      }, [])
  }

  return { getRoutes }
}
