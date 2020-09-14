const c = require('ansi-colors')
let d, uuid

module.exports = new Logger()

function Logger () {
  this.debug = function (...args) {
    log('white', args)
  }

  this.success = function (...args) {
    log('green', args)
  }

  this.info = function (...args) {
    log('cyan', args)
  }

  this.warn = function (...args) {
    log('yellow', args)
  }

  this.error = function (...args) {
    log('red', args)
  }

  this._setD = function (discover, drosseUuid) {
    d = discover
    uuid = drosseUuid
  }
}

function getTime () {
  return (new Date()).toLocaleTimeString()
}

function log (color, args) {
  args = args.map(arg => {
    if (typeof arg === 'object') {
      return JSON.stringify((arg))
    }
    return arg
  })

  const msg = [c.gray(getTime()), c[color](args.join(' '))]

  if (d && d.channels.length) {
    d.send('log', { uuid, msg })
  }

  console.log(...msg)
}
