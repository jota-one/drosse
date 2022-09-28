import ansiColors from 'ansi-colors'

function Logger() {
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

function getTime() {
  return new Date().toLocaleTimeString()
}

function log(color, args) {
  args = args.map(arg => {
    if (typeof arg === 'object') {
      return JSON.stringify(arg)
    }
    return arg
  })

  console.log(ansiColors.gray(getTime()), ansiColors[color](args.join(' ')))
}

export default new Logger()
