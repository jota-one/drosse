module.exports = {
  command: 'serve',
  describe: 'Serve the mock server',
  builder: {
    root: {
      required: true,
      alias: 'r',
      describe: 'Path to the root folder where all mocks will be stored.',
      default: '.',
    },
    port: {
      required: false,
      alias: 'p',
      describe: 'Port on which to serve the mocks',
    },
  },

  handler(yargs) {
    const app = require('../app')
    app(yargs)
  },
}
