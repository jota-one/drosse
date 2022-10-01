let defaults = []
let pool = {}

export default function useMiddlewares() {
  return {
    setDefaults(mw) {
      defaults = [...mw]
    },

    setPool(mw) {
      pool = { ...pool, ...mw }
    },

    get(name) {
      return pool[name]
    },

    list() {
      return { defaults, pool }
    },
  }
}
