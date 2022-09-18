import config from '../config'

let state = config.templates

export default function useTemplates() {
  return {
    merge(tpls) {
      state = { ...state, ...tpls }
    },

    set(tpl) {
      state = tpl
    },

    list() {
      return state
    },
  }
}
