export default function useRoutes () {
  const getRoutes = drosse => {
    console.log(drosse.value.config.routes)

    return []
  }

  return { getRoutes }
}


