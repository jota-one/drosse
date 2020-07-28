const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const ip = require('ip')
const Discover = require('node-discover')
const useState = require('./use/useState')
const useDb = require('./use/useDb')
const { checkRootFile, loadRcFile, routes } = require('./io')
const { parse, createProxies } = require('./parser')

const d = new Discover()
const app = express()
const state = useState()
const db = useDb()

const RESERVED_ROUTES = { ui: '/UI' }

// global middlewares
app.use(bodyParser.json())
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')

  // intercept OPTIONS method
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})
app.use((req, res, next) => {
  if (!Object.values(RESERVED_ROUTES).includes(req.url)) {
    d.send('request', {
      url: req.url,
      method: req.method
    })
  }
  next()
})

// start server
module.exports = async args => {
  state.set('root', (args.root && path.resolve(args.root)) || path.resolve('.'))

  // check for some users configuration in a .drosserc(.js) file
  loadRcFile()

  // run some checks
  if (!checkRootFile()) {
    console.error(`Please create a "${state.get('routesFile')}.json" or a "${state.get('routesFile')}.js" file in this directory: ${state.get('root')}, and restart.`)
    process.exit()
  }

  // if everything is well configured, load database and create the routes
  const ioRoutes = routes()
  await db.loadDb()
  parse(app, ioRoutes)
  createProxies(app)

  // add reserved UI route
  app.get(RESERVED_ROUTES.ui, (req, res) => {
    res.send({
      routes: ioRoutes
    })
  })

  // start server and display drosse infos in console
  const getAdress = (proto, host, port) => `${proto}://${host}:${port}`
  const ipAddress = ip.address()
  const proto = 'http'
  const hosts = ['localhost', ipAddress]
  const port = args.port || state.get('port')
  const name = state.get('name')
  const root = state.get('root')
  const hostsStr = '\n - ' + hosts
    .map(host => getAdress(proto, host, port)).join('\n - ')

  app.listen(port, 'localhost')
  app.listen(port, ipAddress, () => {
    console.log(`App started${name && ': name -> ' + name}`)
    console.log(`Listening to requests on ${hostsStr}`)
    console.log(`The mocks will be read/written here: ${state.get('root')}`)
  })

  // advertise UI of server's presence
  d.advertise({ name, proto, hosts, port, root })
  d.send('up', { name, proto, hosts, port, root })
}
