const config = require('../config')
const _ = require('lodash')

let state = JSON.parse(JSON.stringify(config.state))

module.exports = function () {
  return {
    set(key, value) {
      state[key] = value
    },
    get(key) {
      if (key) {
        return state[key]
      }
      return state
    },
    merge(conf) {
      state = _.merge(state, conf)
    },
  }
}
