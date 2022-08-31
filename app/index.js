const path = require('path')
const c = require('ansi-colors')
const ip = require('ip')
const http = require('http')
const express = require('express')
const stoppable = require('stoppable')
const lodash = require('lodash')
const getPort = require('get-port')
const config = require('./config')
const logger = require('./logger')
const openCors = require('./middlewares/open-cors')
const useState = require('./use/state')
const useMiddlewares = require('./use/middlewares')
const useDb = require('./use/db')
const useTemplates = require('./use/templates')
const useCommand = require('./use/command')
const useIo = require('./use/io')
const { createRoutes } = require('./builder')
const version = require('../package.json').version
const api = require('./api')()

const app = express()
const server = http.createServer(app)
const state = useState()
const middlewares = useMiddlewares()
const db = useDb()
const { checkRoutesFile, loadUuid, getUserConfig, routes } = useIo()
const { executeCommand } = useCommand()

process.send = process.send || function () {}

let configureExpress, onHttpUpgrade

const initServer = async args => {
  // very first action -> set the 'root' directory in the state. Will be useful for further operations.
  state.set(
    'root',
    path.resolve(args.root || (args._.length > 2 && args._[2]) || '.')
  )

  // check for some users configuration in a drosserc.js file and update state
  const userConfig = await getUserConfig()
  onHttpUpgrade = userConfig.onHttpUpgrade
  configureExpress = userConfig.configureExpress
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
  middlewares.set(config.middlewares)
  if (userConfig.middlewares) {
    middlewares.append(userConfig.middlewares)
  }

  if (userConfig.templates) {
    useTemplates().merge(userConfig.templates)
  }

  if (userConfig.commands) {
    useCommand().merge(userConfig.commands(require('./api')()))
  }

  // load uuid from the .uuid file (create it if needed), needed for the UI
  // only do it if routesFile exists to prevent creating useless .uuid file
  loadUuid()
  process.send({ event: 'uuid', data: state.get('uuid') })

  // extend express app
  if (typeof configureExpress === 'function') {
    configureExpress({ server, app, db: api.db })
  }

  app.use(express.urlencoded({ extended: true }))
  app.use(express.json())

  // register custom global middlewares
  logger.info('-> Middlewares:')
  console.log(middlewares.list())
  middlewares.list().forEach(mw => {
    if (typeof mw !== 'function') {
      mw = require('./middlewares/' + mw)
    }

    // if the middleware signature has 4 arguments, we assume that the first one is the Drosse `api`
    if (mw.length === 4) {
      mw = lodash.curry(mw)(api)
    }
    app.use(mw)
  })

  // if everything is well configured, create the routes
  const ioRoutes = routes()

  const inherited = createRoutes(app, ioRoutes)

  if (userConfig.errorHandler) {
    app.use(userConfig.errorHandler)
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

  // add reserved CMD route
  app.post(state.get('reservedRoutes').cmd, openCors, async (req, res) => {
    if (req.body.cmd === 'restart') {
      setTimeout(() => process.send({event: 'restart'}), 100)
      res.send({ success: true })
    } else {
      await executeCommand({ name: req.body.cmd, params: req.body })
      res.send({ success: true })
    }
  })
}

const initDiscoverConfig = async args => {
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
    version,
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

const onStart = discoverConfig => {
  const getAddress = (proto, host, port) => `${proto}://${host}:${port}`

  setTimeout(() => {
    console.log()
    logger.debug(
      `App ${
        discoverConfig.name ? c.magenta(discoverConfig.name) + ' ' : ''
      }(version ${c.magenta(discoverConfig.version)}) running at:`
    )
    discoverConfig.hosts.forEach(host => {
      logger.info(
        ' -',
        getAddress(discoverConfig.proto, host, discoverConfig.port)
      )
    })
    console.log()
    logger.debug(`Mocks root: ${c.magenta(state.get('root'))}`)
    console.log()

    process.send({ event: 'ready', data: state.get() })
  }, 100)

  // advertise UI of our presence
  process.send({ event: 'advertise', data: discoverConfig })
  process.send({ event: 'up', data: discoverConfig })
}

const init = async args => {
  await initServer(args)
  return initDiscoverConfig(args)
}

// start server
module.exports = async args => {
  const discoverConfig = await init(args)

  const start = async () => {
    server.listen(discoverConfig.port, '0.0.0.0', () => {
      onStart(discoverConfig)
    })

    // Execute onHttpUpgrade callback to activate websocket connection
    if (typeof onHttpUpgrade === 'function') {
      server.on('upgrade', onHttpUpgrade)
    }

    stoppable(server, 100)
  }

  const stop = () => {
    server.stop(() => {
      logger.warn('Server stopped by UI')
      process.send({ event: 'downUI', data: discoverConfig })
    })
  }

  process.on('message', async ({ event, data }) => {
    if (event === 'start') {
      logger.warn('Server started by UI')
    }

    if (event === 'stop') {
      stop()
    }

    if (event === 'cmd') {
      const result = await executeCommand(data)
      process.send({ event: 'cmdDone', data: result })
    }
  })

  return { start }
}
