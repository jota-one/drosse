const config = require('../config')
let state = config.middlewares

module.exports = function () {
  return {
    append (mw) {
      state = [...state, ...mw]
    },

    set (mw) {
      state = [...mw]
    },

    list () {
      return state
    }
  }
}
