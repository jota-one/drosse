const path = require('path')
const c = require('ansi-colors')
const ip = require('ip')
const express = require('express')
const stoppable = require('stoppable')
const getPort = require('get-port')
const config = require('./config')
const logger = require('./logger')
const openCors = require('./middlewares/open-cors')
const useState = require('./use/state')
const useMiddlewares = require('./use/middlewares')
const useDb = require('./use/db')
const { checkRoutesFile, loadUuid, loadRcFile, routes } = require('./io')
const { createRoutes } = require('./builder')

const app = express()
const state = useState()
const middlewares = useMiddlewares()
const db = useDb()

process.send = process.send || function () {}

const initServer = async args => {
  state.set('root', (args.root && path.resolve(args.root)) || path.resolve('.'))
  middlewares.set(config.middlewares)

  // check for some users configuration in a drosserc.js file
  loadRcFile()

  // load uuid from the .uuid file (create it if needed), needed for the UI
  loadUuid()
  process.send({ event: 'uuid', data: state.get('uuid') })

  // run some checks
  if (!checkRoutesFile()) {
    logger.error(
      `Please create a "${state.get('routesFile')}.json" or a "${state.get(
        'routesFile'
      )}.js" file in this directory: ${state.get('root')}, and restart.`
    )
    process.exit()
  }

  // register custom global middlewares
  logger.info('-> Middlewares:')
  console.log(middlewares.list())
  middlewares.list().forEach(mw => {
    if (typeof mw !== 'function') {
      mw = require('./middlewares/' + mw)
    }
    app.use(mw)
  })

  // if everything is well configured, load database and create the routes
  const ioRoutes = routes()
  const errorHandler = state.get('errorHandler')

  await db.loadDb()
  const inherited = createRoutes(app, ioRoutes)

  if (errorHandler) {
    app.use(errorHandler)
  }

  // notify the UI for every request made
  app.use((req, res, next) => {
    if (!Object.values(state.get('reservedRoutes')).includes(req.url)) {
      process.send({
        event: 'request',
        data: {
          uuid: state.get('uuid'),
          url: req.url,
          method: req.method,
        },
      })
    }
    next()
  })

  // add reserved UI route
  app.get(state.get('reservedRoutes').ui, openCors, (req, res) => {
    res.send({ routes: ioRoutes, inherited })
  })

  return { routes: ioRoutes, inherited, middlewares }
}

const initDrosse = async args => {
  const ipAddress = ip.address()
  const proto = 'http'
  const hosts = ['localhost', ipAddress]
  const name = state.get('name')
  const routesFile = state.get('routesFile')
  const collectionsPath = state.get('collectionsPath')
  let port = state.get('port')

  if (port === config.state.port) {
    port = await getPort({
      port: getPort.makeRange(port, port + 2000),
      host: '0.0.0.0',
    })
  }

  const root = state.get('root')
  const uuid = state.get('uuid')

  return {
    isDrosse: true,
    uuid,
    name,
    proto,
    hosts,
    port,
    root,
    routesFile,
    collectionsPath,
  }
}

const onStart = drosse => {
  const getAddress = (proto, host, port) => `${proto}://${host}:${port}`

  setTimeout(() => {
    console.log()
    logger.debug(
      `App ${drosse.name ? c.magenta(drosse.name) + ' ' : ''}running at:`
    )
    drosse.hosts.forEach(host => {
      logger.info(' -', getAddress(drosse.proto, host, drosse.port))
    })
    console.log()
    logger.debug(`Mocks root: ${c.magenta(state.get('root'))}`)
    console.log()
  }, 100)

  // advertise UI of our presence
  process.send({ event: 'advertise', data: drosse })
  process.send({ event: 'up', data: drosse })
}

const init = async args => {
  const server = await initServer(args)
  const drosse = await initDrosse(args)
  return { ...server, drosse }
}

// start server
module.exports = async args => {
  const { drosse, routes, inherited, middlewres } = await init(args)
  let server

  const start = async () => {
    server = app.listen(drosse.port, '0.0.0.0', () => {
      onStart(drosse)
    })
    stoppable(server, 100)
  }

  const stop = () => {
    server.stop(() => {
      logger.warn('Server stopped by UI')
      process.send({ event: 'down', data: drosse })
    })
  }

  const exitHandler = arg => {
    process.send({ event: 'down', data: drosse })
    setTimeout(() => {
      if (typeof arg === 'object') {
        console.log(arg)
      }
      process.exit()
    }, 0)
  }

  process.on('message', ({ event, data }) => {
    if (event === 'start') {
      logger.warn('Server started by UI')
    }

    if (event === 'stop') {
      stop()
    }
  })

  // handle process exits and tell UI we are down
  process.stdin.resume()

  // app closes
  process.on('exit', exitHandler)

  // catch ctrl+c event
  process.on('SIGINT', exitHandler)

  // catch "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler)
  process.on('SIGUSR2', exitHandler)

  // catch uncaught exceptions
  process.on('uncaughtException', exitHandler)

  return { drosse, routes, inherited, middlewres, start, stop }
}
