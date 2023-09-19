import { resolve } from 'path'

import ansiColors from 'ansi-colors'
import {
  createApp,
  createRouter,
  readBody,
  eventHandler,
  toNodeListener,
  setResponseStatus,
  send,
  sendError
} from 'h3'
import { listen } from 'listhen'

import { curry } from '../helpers'
import { RESTART_DISABLED_IN_ESM_MODE } from '../messages'

import config from './config'
import logger from './logger'
import { createRoutes } from './builder'
import internalMiddlewares from './middlewares'

import useAPI from './composables/useAPI'
import useCommand from './composables/useCommand'
import useDB from './composables/useDB'
import useIO from './composables/useIO'
import useLoader from './composables/useLoader'
import useMiddlewares from './composables/useMiddlewares'
import useState from './composables/useState'
import useTemplates from './composables/useTemplates'

const api = useAPI()
const { executeCommand } = useCommand()
const { loadDb } = useDB()
const { checkRoutesFile, loadUuid, getUserConfig, getRoutesDef } = useIO()
const { isEsmMode } = useLoader()
const middlewares = useMiddlewares()
const state = useState()

let app, emit, root, listener, userConfig, version, port

export const init = async (_root, _emit, _version, _port) => {
  version = _version
  root = resolve(_root)
  emit = _emit
  port = _port

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
  let onError = undefined
  
  if (userConfig.errorHandler) {
    onError = async (error, event) => {
      const { statusCode, response } = await userConfig.errorHandler(error, event)
      setResponseStatus(event, statusCode)
      return send(event, JSON.stringify(response))
    }
  }

  app = createApp({
    debug: true,
    ...(onError ? { onError } : {})
  })

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

  // register custom global middlewares
  logger.info('-> Middlewares:')

  console.info(middlewares.list())

  for (let mw of middlewares.list()) {
    if (typeof mw !== 'function') {
      mw = internalMiddlewares[mw]
    }

    // if the middleware signature has 2 arguments, we assume that the first one is the Drosse `api`
    if (mw.length === 2) {
      mw = curry(mw)(api)
    }

    app.use(eventHandler(mw))
  }

  // if everything is well configured, create the routes
  const routesDef = await getRoutesDef()
  const router = createRouter()
  await createRoutes(app, router, routesDef)

  // notify the UI for every request made
  app.use(
    eventHandler(req => {
      if (!Object.values(state.get('reservedRoutes')).includes(req.url)) {
        emit('request', {
          url: req.url,
          method: req.method,
        })
      }
    })
  )

  // add reserved UI route
  app.use(
    state.get('reservedRoutes').ui,
    eventHandler(internalMiddlewares['open-cors'])
  )
  router.get(
    state.get('reservedRoutes').ui,
    eventHandler(() => {
      return { routes: routesDef }
    })
  )

  // add reserved CMD route
  app.use(
    state.get('reservedRoutes').cmd,
    eventHandler(internalMiddlewares['open-cors'])
  )
  router.post(
    state.get('reservedRoutes').cmd,
    eventHandler(async event => {
      const body = await readBody(event)

      if (body.cmd === 'restart') {
        emit('restart')
        if (isEsmMode()) {
          return {
            restarted: false,
            comment: RESTART_DISABLED_IN_ESM_MODE,
          }
        } else {
          return { restarted: true }
        }
      } else {
        const result = await executeCommand({
          name: body.cmd,
          params: body,
        })

        return result
      }
    })
  )

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

  listener = await listen(toNodeListener(app), {
    port: port || description.port,
  })

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
  return listener
}

export const stop = async () => {
  await listener.close()
  logger.warn('Server stopped')
  emit('stop')
}

export const restart = async () => {
  if (isEsmMode()) {
    console.warn(RESTART_DISABLED_IN_ESM_MODE)
    console.info('Please use ctrl+c to restart drosse.')
  } else {
    await stop()
    await start()
  }
}

export const describe = () => {
  return getDescription()
}
