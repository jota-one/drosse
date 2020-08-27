const path = require('path')
const express = require('express')
const stoppable = require('stoppable')
const bodyParser = require('body-parser')
const ip = require('ip')
const Discover = require('node-discover')
const useState = require('./use/state')
const useDb = require('./use/db')
const { checkRoutesFile, loadUuid, loadRcFile, routes } = require('./io')
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
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, X-Username')
  res.header('Access-Control-Allow-Credentials', true)

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

const initServer = async args => {
  state.set('root', (args.root && path.resolve(args.root)) || path.resolve('.'))

  // check for some users configuration in a .drosserc(.js) file
  loadRcFile()

  // run some checks
  if (!checkRoutesFile()) {
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
}

const initDrosse = args => {
  const ipAddress = ip.address()
  const proto = 'http'
  const hosts = ['localhost', ipAddress]
  const name = state.get('name')
  const port = args.port || state.get('port')
  const root = state.get('root')
  const uuid = state.get('uuid')

  return { isDrosse: true, name, proto, hosts, port, root, uuid }
}

const onStart = drosse => {
  const getAddress = (proto, host, port) => `${proto}://${host}:${port}`
  const hostsStr = '\n - ' + drosse.hosts
    .map(host => getAddress(drosse.proto, host, drosse.port)).join('\n - ')

  setTimeout(() => {
    console.log(`App started${drosse.name && ': name -> ' + drosse.name}`)
    console.log(`Listening to requests on ${hostsStr}`)
    console.log(`The mocks will be read/written here: ${state.get('root')}`)
  }, 100)

  // advertise UI of our presence
  d.advertise(drosse)
  d.send('up', drosse)
}

const init = args => {
  initServer(args)
  return initDrosse(args)
}

// start server
module.exports = async args => {
  let drosse, server

  const start = () => {
    drosse = init(args)
    server = app.listen(drosse.port, '0.0.0.0', () => { onStart(drosse) })
    stoppable(server, 100)
  }

  const stop = () => {
    server.stop(() => {
      console.log('Server stopped by UI')
      d.send('down', drosse)
    })
  }

  const restart = () => {
    stop()
    start()
  }

  start()

  d.join('start', uuid => {
    if (uuid === drosse.uuid) {
      console.log('Server started by UI')
      start()
    }
  })

  d.join('stop', uuid => {
    if (uuid === drosse.uuid) {
      stop()
    }
  })

  d.join('restart', uuid => {
    if (uuid === drosse.uuid) {
      restart()
    }
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
