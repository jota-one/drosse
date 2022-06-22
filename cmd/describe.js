module.exports = {
  command: 'describe',
  describe: 'Describe the mock server',
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
    const { config } = await app(yargs)

    console.log(config)
    process.exit(0)
  },
}
