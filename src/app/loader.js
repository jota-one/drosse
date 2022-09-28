import { resolve } from 'path'
import { createRequire } from 'module'

import useState from './composables/useState'

const require = createRequire(import.meta.url)

const getFullPath = path => {
  const state = useState()
  const root = state.get('root') || __dirname
  return resolve(root, path)
}

export const load = async function(path) {
  let module
  const fullPath = getFullPath(path)

  console.info('🗂  loading module', fullPath)
  
  delete require.cache[fullPath]
  module = require(fullPath)

  return module
}
