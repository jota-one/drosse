module.exports = {
  db: {
    reservedFields: ['DROSSE', 'meta', '$loki'],
  },
  state: {
    name: 'Drosse mock server',
    port: 8000,
    baseUrl: '',
    basePath: '',
    routesFile: 'routes',
    collectionsPath: 'collections',
    shallowCollections: [],
    assetsPath: 'assets',
    scraperServicesPath: 'scrapers',
    servicesPath: 'services',
    scrapedPath: 'scraped',
    staticPath: 'static',
    database: 'mocks.json',
    reservedRoutes: { ui: '/UI' },
    uuid: '',
  },
  middlewares: ['body-parser-json', 'morgan'],
  templates: {},
}
