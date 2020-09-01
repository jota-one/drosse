const config = require('../config')
let state = config.middlewares

module.exports = function () {
  return {
    append (mw) {
      state.push(mw)
    },

    set (mws) {
      state = [...mws]
    },

    list () {
      return state
    }
  }
}
