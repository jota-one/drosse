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
    dbAdapter: 'LokiFsAdapter',
    reservedRoutes: { ui: '/UI' },
    uuid: '',
  },
  commands: {},
  middlewares: ['morgan'],
  templates: {},
  onHttpUpgrade: null,
}
