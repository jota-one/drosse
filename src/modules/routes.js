import useParser from '@jota-one/drosse/app/use/parser'

export default function useRoutes () {
  const getRoutes = drosseConfig => {
    const { parse } = useParser()
    const routes = []

    const onRouteDef = (def, root) => {
      const path = `/${root.join('/')}`
      const level = 1

      routes.push({ level, path  })
      console.log({ def, root })
    }

    parse({
      routes: drosseConfig.routes,
      onRouteDef
    })

    return routes.reverse()
  }

  return { getRoutes }
}


