module.exports = {
  db: {
    reservedFields: ['DROSSE', 'meta', '$loki'],
  },
  state: {
    name: 'Drosse mock server',
    port: 8000,
    routesFile: 'routes',
    collectionsPath: 'collections',
    shallowCollections: [],
    servicesPath: 'services',
    staticPath: 'static',
    database: 'mocks.db',
    reservedRoutes: { ui: '/UI' },
  },
  middlewares: ['body-parser-json', 'morgan'],
  templates: {},
}
