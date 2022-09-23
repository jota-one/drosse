import { resolve } from 'path'

import ansiColors from 'ansi-colors'
import { createApp, createRouter, readBody } from 'h3'
import { listen } from 'listhen'
import { curry } from 'lodash'

import config from './config'
import logger from './logger'
import { createRoutes } from './builder'
import internalMiddlewares from './middlewares'

import useAPI from './composables/useAPI'
import useCommand from './composables/useCommand'
import useDB from './composables/useDB'
import useIO from './composables/useIO'
import useMiddlewares from './composables/useMiddlewares'
import useState from './composables/useState'
import useTemplates from './composables/useTemplates'

const api = useAPI()
const { executeCommand } = useCommand()
const { loadDb } = useDB()
const { checkRoutesFile, loadUuid, getUserConfig, getRoutesDef } = useIO()
const middlewares = useMiddlewares()
const state = useState()

let app, emit, root, listener, userConfig, version

export const init = async (_root, _emit, _version) => {
  version = _version
  root = resolve(_root)
  emit = _emit

  // very first action -> set the 'root' directory in the state. Will be useful for further operations.
  state.set('root', root)

  // check for some users configuration in a drosserc.js file and update state
  userConfig = await getUserConfig()
  state.merge(userConfig)

  // run some checks
  if (!(await checkRoutesFile())) {
    logger.error(
      `Please create a "${state.get(
        'routesFile'
      )}.json" file in this directory: ${state.get('root')}, and restart.`
    )
    process.exit()
  }

  // load uuid from the .uuid file (create it if needed), needed for the UI
  // only do it if routesFile exists to prevent creating useless .uuid file
  await loadUuid()
}

const initServer = async () => {
  app = createApp({ debug: true })

  // start and populate database as early as possible
  await loadDb()

  // set other user defined properties that are not part of the state
  middlewares.set(config.middlewares)
  
  if (userConfig.middlewares) {
    middlewares.append(userConfig.middlewares)
  }

  if (userConfig.templates) {
    useTemplates().merge(userConfig.templates)
  }

  if (userConfig.commands) {
    useCommand().merge(userConfig.commands(api))
  }
  
  // app.use(express.urlencoded({ extended: true }))
  // app.use(express.json())

  // register custom global middlewares
  logger.info('-> Middlewares:')
  
  console.info(middlewares.list())
  
  for (let mw of middlewares.list()) {
    if (typeof mw !== 'function') {
      mw = internalMiddlewares[mw]
    }

    // if the middleware signature has 4 arguments, we assume that the first one is the Drosse `api`
    // if (mw.length === 4) {
    //   mw = curry(mw)(api)
    // }

    app.use(mw)
  }

  // if everything is well configured, create the routes
  const routesDef = await getRoutesDef()
  const router = createRouter()
  await createRoutes(app, router, routesDef)

  if (userConfig.errorHandler) {
    app.use(userConfig.errorHandler)
  }

  // notify the UI for every request made
  app.use(req => {
    if (!Object.values(state.get('reservedRoutes')).includes(req.url)) {
      emit('request', {
        url: req.url,
        method: req.method,
      })
    }
  })

  // add reserved UI route
  app.use(state.get('reservedRoutes').ui, internalMiddlewares['open-cors'])
  router.get(state.get('reservedRoutes').ui, () => {
    return { routes: routesDef }
  })

  // add reserved CMD route
  app.use(state.get('reservedRoutes').cmd, internalMiddlewares['open-cors'])
  router.post(state.get('reservedRoutes').cmd, async req => {
    const body = await readBody(req)

    if (body.cmd === 'restart') {
      emit('restart')
      return { restarted: true }
    } else {
      const result = await executeCommand({
        name: body.cmd,
        params: body
      })
      
      return result
    }
  })

  // Register router
  app.use(router)
}

const getDescription = () => ({
  isDrosse: true,
  version,
  uuid: state.get('uuid'),
  name: state.get('name'),
  proto: 'http',
  port: state.get('port'),
  root: state.get('root'),
  routesFile: state.get('routesFile'),
  collectionsPath: state.get('collectionsPath'),
})

export const start = async () => {
  await initServer()
  const description = getDescription()
  
  console.log()
  logger.debug(
    `App ${
      description.name ? ansiColors.magenta(description.name) + ' ' : ''
    }(version ${ansiColors.magenta(version)}) running at:`
  )

  listener = await listen(app, { port: description.port })

  // extend server
  if (typeof userConfig.extendServer === 'function') {
    userConfig.extendServer({ server: listener.server, app, db: api.db })
  }

  // Execute onHttpUpgrade callback to activate websocket connection
  if (typeof userConfig.onHttpUpgrade === 'function') {
    listener.server.on('upgrade', userConfig.onHttpUpgrade)
  }

  console.log()
  logger.debug(`Mocks root: ${ansiColors.magenta(description.root)}`)
  console.log()

  emit('start', state.get())
}

export const stop = async () => {
  await listener.close()
  logger.warn('Server stopped')
  emit('stop')
}

export const restart = async () => {
  await stop()
  await start()
}

export const describe = () => {
  return getDescription()
}