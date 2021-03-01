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
    assetsPath: 'assets',
    scraperServicesPath: 'scrapers',
    servicesPath: 'services',
    staticPath: 'static',
    database: 'mocks.json',
    reservedRoutes: { ui: '/UI' },
  },
  middlewares: ['body-parser-json', 'morgan'],
  templates: {},
}
