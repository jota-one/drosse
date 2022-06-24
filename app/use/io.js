const fs = require('fs')
const path = require('path')
const rrdir = require('rrdir')
const { isEmpty, cloneDeep } = require('lodash')
const { v4: uuidv4 } = require('uuid')
const { replace } = require('@jota-one/replacer')
const useState = require('./state')
const logger = require('../logger')
const state = useState()
const requireRuntime = require('require-runtime')

const checkRoutesFile = () => {
  const filePath = path.join(
    state.get('root'),
    `${state.get('routesFile')}.json`
  )
  if (fs.existsSync(filePath)) {
    state.set('_routesFile', filePath)
    return true
  }
  return false
}

const getUserConfig = async root => {
  const rcFile = path.join(root || state.get('root') || '', '.drosserc.js')
  try {
    await fs.promises.stat(rcFile)
    return require(rcFile)
  } catch (e) {
    console.log('Could not load any user config.')
    console.error(e)
    return {}
  }
}

const loadService = (routePath, verb) => {
  const serviceFile =
    path.join(
      state.get('root'),
      state.get('servicesPath'),
      routePath.filter(el => el[0] !== ':').join('.')
    ) + `.${verb}.js`

  if (!fs.existsSync(serviceFile)) {
    return function () {
      logger.error(`service [${serviceFile}] not found`)
    }
  }

  return requireRuntime(serviceFile)
}
const loadScraperService = routePath => {
  const serviceFile =
    path.join(
      state.get('root'),
      state.get('scraperServicesPath'),
      routePath.filter(el => el[0] !== ':').join('.')
    ) + '.js'

  if (!fs.existsSync(serviceFile)) {
    return function () {
      logger.error(`scraper service [${serviceFile}] not found`)
    }
  }

  return requireRuntime(serviceFile)
}

const writeScrapedFile = async (filename, content) => {
  const root = path.join(state.get('root'), state.get('scrapedPath'))
  await fs.promises.writeFile(
    path.join(root, filename),
    JSON.stringify(content),
    'utf-8'
  )
  return true
}

const loadStatic = async ({
  routePath,
  params = {},
  query = {},
  verb = null,
  skipVerb = false,
  extensions = ['json']
}) => {
  const root = path.join(state.get('root'), state.get('staticPath'))
  const files = rrdir.sync(root)
  return findStatic({ root, files, routePath, params, verb, skipVerb, query, extensions })
}

const loadScraped = async ({
  routePath,
  params = {},
  query = {},
  verb = null,
  skipVerb = false,
  extensions = ['json'],
}) => {
  const root = path.join(state.get('root'), state.get('scrapedPath'))
  const files = rrdir.sync(root)
  return findStatic({ root, files, extensions, routePath, params, verb, skipVerb, query })
}

const loadUuid = () => {
  const uuidFile = path.join(state.get('root'), '.uuid')

  if (!fs.existsSync(uuidFile)) {
    fs.writeFileSync(uuidFile, uuidv4(), 'utf8')
  }

  state.merge({ uuid: fs.readFileSync(uuidFile, 'utf8') })
}

const routes = () => {
  const content = fs.readFileSync(state.get('_routesFile'), 'utf8')
  return JSON.parse(content)
}

const getStaticFileName = (routePath, extension, params = {}, verb = null, query = {}) => {
  const queryPart = Object.entries(query)
    .sort(([name1], [name2]) => {
      return name1 > name2 ? 1 : -1
    })
    .reduce((acc, [name, value]) => {
      return acc.concat(`${name}=${value}`)
    }, [])
    .join('&')

  let filename = replace(
    routePath
      .join('.')
      .concat(verb ? `.${verb.toLowerCase()}` : '')
      .replace(/:([^\\/\\.]+)/gim, '{$1}')
      .concat(queryPart ? `&&${queryPart}` : ''),
    params
  )

  const extensionLength = extension.length
  return filename.concat(filename.slice(-(extensionLength + 1)) === `.${extension}` ? '' : `.${extension}`)
}

const findStatic = async ({
  root,
  files,
  routePath,
  extensions,
  params = {},
  verb = null,
  skipVerb = false,
  query = {},
  initial = null,
  extensionIndex = 0
}) => {
  const fs = require('fs').promises
  const normalizedPath = filePath => filePath.replace(root, '').substring(1)

  // if initial is null, it's the very first call (before recursion), we save the initial parameters for
  // further replacements in the file content, once found.
  if (initial === null) {
    initial = cloneDeep({
      params,
      query,
      verb,
      skipVerb,
    })
  }

  const filename = getStaticFileName(
    routePath,
    extensions[extensionIndex],
    params,
    !skipVerb && verb,
    query
  )
  let staticFile = path.join(root, filename)

  const foundFiles = files.filter(
    file =>
      normalizedPath(file.path).replace(/\//gim, '.') ===
      normalizedPath(staticFile)
  )

  if (foundFiles.length > 1) {
    const error = `findStatic: more than 1 file found for:\n[${staticFile}]:\n${foundFiles
      .map(f => f.path)
      .join('\n')}`

    throw new Error(error)
  }

  if (foundFiles.length === 0) {
    // try without the query string if there was any
    if (!isEmpty(query)) {
      logger.error(`findStatic: tried with [${staticFile}]. File not found.`)
      return findStatic({
        root,
        files,
        routePath,
        params,
        verb,
        skipVerb,
        extensions,
        initial,
        extensionIndex,
      })
    }

    // if a verb was provided and not yet skipped, try to skip it
    if (verb && !skipVerb) {
      logger.error(`findStatic: tried with [${staticFile}]. File not found.`)
      return findStatic({
        root,
        files,
        routePath,
        params,
        verb,
        skipVerb: true,
        query,
        extensions,
        initial,
        extensionIndex,
      })
    }

    // retry by removing the first param of the list
    if (!isEmpty(params)) {
      logger.error(`findStatic: tried with [${staticFile}]. File not found.`)
      const newParams = Object.keys(params)
        .slice(1)
        .reduce((acc, name) => ({ ...acc, [name]: params[name] }), {})
      return findStatic({
        root,
        files,
        routePath,
        params: newParams,
        verb,
        extensions,
        initial,
        extensionIndex,
      })
    }

    // really didn't find any file matching conditions
    if (extensionIndex === extensions.length - 1) {
      logger.error(`findStatic: I think I've tried everything. No match...`)
      return [false, false]
    } else {
      logger.warn(`findStatic: Okay, tried everything with ${extensions[extensionIndex]} extension. Let's try with the next one.`)
      return findStatic({
        root,
        files,
        routePath,
        params: cloneDeep(initial.params),
        query: cloneDeep(initial.query),
        verb: initial.verb,
        skipVerb: initial.skipVerb,
        extensions,
        initial,
        extensionIndex: extensionIndex + 1,
      })
    }
  } else {
    const foundExtension = extensions[extensionIndex]

    staticFile = foundFiles[0].path
    logger.info(`findStatic: file used: ${staticFile}`)

    if (foundExtension === 'json') {
      const fileContent = await fs.readFile(staticFile, 'utf-8')
      const result = replace(fileContent, initial.params)
      return [JSON.parse(result), foundExtension]
    }
    return [staticFile, foundExtension]
  }
}

module.exports = function useIo() {
  return {
    checkRoutesFile,
    getStaticFileName,
    getUserConfig,
    loadService,
    loadScraperService,
    loadStatic,
    loadScraped,
    loadUuid,
    routes,
    writeScrapedFile,
  }
}
