import { promises as fs } from 'fs'
import { join } from 'path'

import { replace } from '@jota-one/replacer'
import { async as rrdir } from 'rrdir'
import { v4 as uuidv4 } from 'uuid'

import { isEmpty, cloneDeep } from '../../helpers'

import useLoader from './useLoader'
import useState from './useState'
import logger from '../logger'

const state = useState()
const { load } = useLoader()

const fileExists = async path => {
  let exists

  try {
    await fs.access(path)
    exists = true
  } catch {
    exists = false
  }

  return exists
}

const getScriptFile = async path => {
  let scriptFile = `${path}.js`

  if (await fileExists(scriptFile)) {
    return scriptFile
  }

  scriptFile = `${path}.ts`

  if (await fileExists(scriptFile)) {
    return scriptFile
  }

  throw new Error(`File not found: ${scriptFile}`)
}

const checkRoutesFile = async () => {
  const filePath = join(
    state.get('root'),
    `${state.get('routesFile')}.json`
  )

  if (await fileExists(filePath)) {
    state.set('_routesFile', filePath)
    return true
  }

  return false
}

const getUserConfig = async root => {
  try {
    const rcFilePath = await getScriptFile(
      join(root || state.get('root') || '', '.drosserc')
    )
    return load(rcFilePath)
  } catch (e) {
    console.error('Could not load any user config.')
    console.error(e)
    return {}
  }
}

const loadService = async (routePath, verb) => {
  const serviceFile = await getScriptFile(
    join(
      state.get('root'),
      state.get('servicesPath'),
      routePath.filter(el => el[0] !== ':').join('.')
    ) + `.${verb}`)

  if (!serviceFile) {
    return function () {
      logger.error(`service [${serviceFile}] not found`)
    }
  }

  const service = await load(serviceFile)
  return { serviceFile, service }
}

const loadScraperService = async routePath => {
  const serviceFile = await getScriptFile(
    join(
      state.get('root'),
      state.get('scraperServicesPath'),
      routePath.filter(el => el[0] !== ':').join('.')
    ))

  if (!serviceFile) {
    return function () {
      logger.error(`scraper service [${serviceFile}] not found`)
    }
  }

  return load(serviceFile)
}

const writeScrapedFile = async (filename, content) => {
  const root = join(state.get('root'), state.get('scrapedPath'))
  await fs.writeFile(
    join(root, filename),
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
  const root = join(state.get('root'), state.get('staticPath'))
  const files = await rrdir(root)
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
  const root = join(state.get('root'), state.get('scrapedPath'))
  const files = await rrdir(root)
  return findStatic({ root, files, extensions, routePath, params, verb, skipVerb, query })
}

const loadUuid = async () => {
  const uuidFile = join(state.get('root'), '.uuid')

  // TODO: Refactor to not check if file exists before reading or writing it which could introduce race conditions
  // => cf. https://nodejs.org/api/fs.html#fspromisesaccesspath-mode
  if (!(await fileExists(uuidFile))) {
    await fs.writeFile(uuidFile, uuidv4(), 'utf8')
  }

  const uuid = await fs.readFile(uuidFile, 'utf8')
  state.merge({ uuid })
}

const getRoutesDef = async () => {
  const content = await fs.readFile(state.get('_routesFile'), 'utf8')
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
  let staticFile = join(root, filename)

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
        .reduce((acc, name) => ({...acc, [name]: params[name]}), {})
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
      return [ false, false ]
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

export default function useIO() {
  return {
    checkRoutesFile,
    getRoutesDef,
    getStaticFileName,
    getUserConfig,
    loadService,
    loadScraperService,
    loadStatic,
    loadScraped,
    loadUuid,
    writeScrapedFile,
  }
}
