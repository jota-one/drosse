const fs = require('fs')
const path = require('path')
const rrdir = require('rrdir')
const { isEmpty } = require('lodash')
const { v4: uuidv4 } = require('uuid')
const { replace } = require('@jota-one/replacer')
const useState = require('./state')
const logger = require('../logger')
const state = useState()

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

const getUserConfig = () => {
  const rcFile = path.join(state.get('root'), '.drosserc.js')
  if (fs.existsSync(rcFile)) {
    return require(rcFile)
  }
  return {}
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

  return require(serviceFile)
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

  return require(serviceFile)
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

const loadStatic = ({
  routePath,
  params = {},
  query = {},
  verb = null,
  skipVerb = false,
}) => {
  const root = path.join(state.get('root'), state.get('staticPath'))
  const files = rrdir.sync(root)
  return findStatic(root, files, routePath, params, verb, skipVerb, query)
}

const loadScraped = ({
  routePath,
  params = {},
  query = {},
  verb = null,
  skipVerb = false,
}) => {
  const root = path.join(state.get('root'), state.get('scrapedPath'))
  const files = rrdir.sync(root)
  return findStatic(root, files, routePath, params, verb, skipVerb, query)
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

const getStaticFileName = (routePath, params = {}, verb = null, query = {}) => {
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

  filename = filename.concat(filename.slice(-5) === '.json' ? '' : '.json')

  return filename
}

const findStatic = (
  root,
  files,
  routePath,
  params = {},
  verb = null,
  skipVerb = false,
  query = {}
) => {
  const normalizedPath = filePath => filePath.replace(root, '').substr(1)

  const filename = getStaticFileName(
    routePath,
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

  if (foundFiles.length === 1) {
    staticFile = foundFiles[0].path
    logger.info(`findStatic: file used: ${staticFile}`)
  }

  if (foundFiles.length === 0) {
    logger.error(`findStatic: tried with [${staticFile}]. File not found.`)

    // try without the query string if there was any
    if (!isEmpty(query)) {
      return findStatic(root, files, routePath, params, verb, skipVerb)
    }

    // if a verb was provided and not yet skipped, try to skip it
    if (verb && !skipVerb) {
      return findStatic(root, files, routePath, params, verb, true, query)
    }

    // retry by removing the first param of the list
    if (!isEmpty(params)) {
      logger.error(`findStatic: tried with [${staticFile}]. File not found.`)
      const newParams = Object.keys(params)
        .slice(1)
        .reduce((acc, name) => ({ ...acc, [name]: params[name] }), {})
      return findStatic(root, files, routePath, newParams, verb)
    }

    // really didn't find any file matching conditions
    return false
  }

  return require(staticFile)
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
