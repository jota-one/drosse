const { hateoas, hal } = require('./templates/hateoas')
const global1 = require('./middlewares/global1')
const local1 = require('./middlewares/local1')

module.exports = {
  name: 'Test mocks',
  port: 3636,
  templates: { hateoas, hal },
  middlewares: { global1, local1 }
}
