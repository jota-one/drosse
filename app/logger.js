const c = require('ansi-colors')

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

  console.log(c.gray(getTime()), c[color](args.join(' ')))
}
