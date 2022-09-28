const { hateoas, hal } = require('./templates/hateoas')

module.exports = {
  name: 'Test mocks',
  port: 3636,
  templates: { hateoas, hal }
}
