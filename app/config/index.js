module.exports = {
  db: {
    reservedFields: ['DROSSE', 'meta', '$loki']
  },
  state: {
    port: 8000,
    routesFile: 'routes',
    collectionsPath: 'collections',
    servicesPath: 'services',
    staticPath: 'static',
    database: 'mocks.db',
    reservedRoutes: { ui: '/UI' }
  },
  middlewares: [
    'body-parser-json',
    'morgan'
  ],
  templates: {}
}
