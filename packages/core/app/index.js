const path = require('path')
const c = require('ansi-colors')
const ip = require('ip')
const express = require('express')
const stoppable = require('stoppable')
const lodash = require('lodash')
const getPort = require('get-port')
const config = require('./config')
const logger = require('./logger')
const openCors = require('./middlewares/open-cors')
const useState = require('./use/state')
const useMiddlewares = require('./use/middlewares')
const useCommands = require('./use/commands')
const useDb = require('./use/db')
const useTemplates = require('./use/templates')
const useIo = require('./use/io')
const { createRoutes } = require('./builder')

const app = express()
const state = useState()
const middlewares = useMiddlewares()
const db = useDb()
const { checkRoutesFile, loadUuid, getUserConfig, routes } = useIo()

process.send = process.send || function () {}

const initServer = async args => {
  // very first action -> set the 'root' directory in the state. Will be useful for further operations.
  state.set('root', (args.root && path.resolve(args.root)) || path.resolve('.'))

  // check for some users configuration in a drosserc.js file and update state
  const userConfig = getUserConfig()
  state.merge(userConfig)

  // run some checks
  if (!checkRoutesFile()) {
    logger.error(
      `Please create a "${state.get(
        'routesFile'
      )}.json" file in this directory: ${state.get('root')}, and restart.`
    )
    process.exit()
  }

  // start and populate database as early as possible
  await db.loadDb()

  // set other user defined properties that are not part of the state
  if (userConfig.commands) {
    useCommands().extend(userConfig.commands)
  }

  middlewares.set(config.middlewares)
  if (userConfig.middlewares) {
    middlewares.append(userConfig.middlewares)
  }

  if (userConfig.templates) {
    useTemplates().merge(userConfig.templates)
  }

  // load uuid from the .uuid file (create it if needed), needed for the UI
  loadUuid()
  process.send({ event: 'uuid', data: state.get('uuid') })

  // extend express app
  const configureExpress = state.get('configureExpress')
  if (typeof configureExpress === 'function') {
    configureExpress(app)
  }

  // register custom global middlewares
  logger.info('-> Middlewares:')
  console.log(middlewares.list())
  middlewares.list().forEach(mw => {
    if (typeof mw !== 'function') {
      mw = require('./middlewares/' + mw)
    }

    // if the middleware signature has 4 arguments, we assume that the first one is the Drosse `api`
    if (mw.length === 4) {
      mw = lodash.curry(mw)(require('./api')())
    }
    app.use(mw)
  })

  // if everything is well configured, create the routes
  const ioRoutes = routes()

  const inherited = createRoutes(app, ioRoutes)

  if (state.get('errorHandler')) {
    app.use(state.get('errorHandler'))
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

  return { routes: ioRoutes, inherited }
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

    useCommands().start()
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
  const { drosse, routes, inherited } = await init(args)
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
      process.send({ event: 'downUI', data: drosse })
    })
  }

  const exitHandler = arg => {
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

  return { drosse, routes, inherited, start, stop }
}
