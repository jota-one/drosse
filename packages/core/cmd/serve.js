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
  },

  async handler(yargs) {
    const app = require('../app')
    const { start } = await app(yargs)
    start()
  },
}
