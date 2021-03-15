const config = require('../config')
let state = config.templates

module.exports = function () {
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
