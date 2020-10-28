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
    const { drosse } = await app(yargs)

    process.send = process.send || function () {}
    process.send({
      event: 'describe',
      data: { drosse },
    })

    console.log({ drosse })
    process.exit(0)
  },
}
