const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const ip = require('ip')
const Discover = require('node-discover')
const useState = require('./use/state')
const useDb = require('./use/db')
const { checkRootFile, loadUuid, loadRcFile, routes } = require('./io')
const { createRoutes } = require('./builder')

const d = new Discover()
const app = express()
const state = useState()
const db = useDb()

// global middlewares
app.use(bodyParser.json())
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')

  // intercept OPTIONS method
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})
app.use((req, res, next) => {
  if (!Object.values(state.get('reservedRoutes')).includes(req.url)) {
    d.send('request', {
      uuid: state.get('uuid'),
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

  // load uuid from the .uuid file (create it if needed), needed for the UI
  loadUuid()

  // add reserved UI route
  app.get(state.get('reservedRoutes').ui, (req, res) => {
    res.send({
      routes: ioRoutes
    })
  })

  // if everything is well configured, load database and create the routes
  const ioRoutes = routes()
  await db.loadDb()
  createRoutes(app, ioRoutes)

  // start server and display drosse infos in console
  const getAdress = (proto, host, port) => `${proto}://${host}:${port}`
  const ipAddress = ip.address()
  const proto = 'http'
  const hosts = ['localhost', ipAddress]
  const name = state.get('name')
  const port = args.port || state.get('port')
  const root = state.get('root')
  const uuid = state.get('uuid')
  const hostsStr = '\n - ' + hosts
    .map(host => getAdress(proto, host, port)).join('\n - ')

  const drosse = { isDrosse: true, name, proto, hosts, port, root, uuid }

  app.listen(port, '0.0.0.0', () => {
    console.log(`App started${name && ': name -> ' + name}`)
    console.log(`Listening to requests on ${hostsStr}`)
    console.log(`The mocks will be read/written here: ${state.get('root')}`)

    // advertise UI of our presence
    d.advertise(drosse)
    d.send('up', drosse)
  })

  // handle process exits and tell UI we are down
  process.stdin.resume()

  const exitHandler = arg => {
    d.send('down', drosse)
    setTimeout(() => {
      if (typeof arg === 'object') {
        console.log(arg)
      }
      process.exit()
    }, 0)
  }

  // app closes
  process.on('exit', exitHandler)

  // catch ctrl+c event
  process.on('SIGINT', exitHandler)

  // catch "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler)
  process.on('SIGUSR2', exitHandler)

  // catch uncaught exceptions
  process.on('uncaughtException', exitHandler)
}
