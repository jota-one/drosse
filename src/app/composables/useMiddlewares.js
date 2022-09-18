let state = []

export default function useMiddlewares() {
  return {
    append(mw) {
      state = [...state, ...mw]
    },

    set(mw) {
      state = [...mw]
    },

    list() {
      return state
    },
  }
}
