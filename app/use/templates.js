const config = require('../config')
let state = config.templates

module.exports = function () {
  return {
    add(tpl) {
      state = { ...state, ...tpl }
    },

    set(tpl) {
      state = tpl
    },

    list() {
      return state
    },
  }
}
