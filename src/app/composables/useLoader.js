import { dirname, resolve } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import jiti from 'jiti'

import useState from './useState'

let cjsRequire
const esmMode = import.meta.url.endsWith('.mjs') ||
  process.argv[1].endsWith('.mjs')

const getFullPath = path => {
  const state = useState()
  const root = state.get('root') || __dirname
  return resolve(root, path)
}

const load = async function(path) {
  let module
  const fullPath = getFullPath(path)

  // console.debug(`🗂  loading ${esmMode ? 'esm ' : ''}module ${fullPath}`)

  if (fullPath.endsWith('.ts')) {
    module = jiti(null, { interopDefault: true })(`file://${fullPath}`)
  } else if (esmMode) {
    module = (await import(fullPath)).default
  } else {
    if (!cjsRequire) {
      cjsRequire = createRequire(import.meta.url)
    }

    delete require.cache[fullPath]
    module = require(fullPath)
  }

  return module
}

const isEsmMode = function() {
  return esmMode
}

export default function useIO() {
  return { isEsmMode, load }
}
