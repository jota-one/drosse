const config = require('../config')
const merge = require('lodash/merge')
const pick = require('lodash/pick')

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
      // merge only authorized (aka already defined) keys into the state
      const keysWhitelist = Object.keys(state)
      state = merge(state, pick(conf, keysWhitelist))
    },
  }
}
