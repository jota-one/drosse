// import * as _cloneDeep from 'lodash-es/cloneDeep'
// import * as _curry from 'lodash-es/curry'
// import * as _get from 'lodash-es/get'
// import * as _isEmpty from 'lodash-es/isEmpty'
// import * as _merge from 'lodash-es/merge'
// import * as _omit from 'lodash-es/omit'
// import * as _pick from 'lodash-es/pick'
// import * as _set from 'lodash-es/set'

// export const cloneDeep = _cloneDeep.default
// export const curry = _curry.default
// export const get = _get.default
// export const isEmpty = _isEmpty.default
// export const merge = _merge.default
// export const omit = _omit.default
// export const pick = _pick.default
// export const set = _set.default

import { promises as fs } from 'fs'
import mergician from 'mergician'

function cleanIndexInpath(pathPart) {
  return pathPart.startsWith('[') ? pathPart.replace(/\D/g, '') : pathPart
}

/**
 * Gets a cleanup array of object paths.
 * @function getObjectPaths
 * @param  {(string|string[])} paths The input paths.
 * @return {Array} The cleaned object paths.
 */
function getObjectPaths(paths) {
  return [].concat(paths)
    .map(path =>
      path
        .split('.')
        .map(cleanIndexInpath).join('.')
    )
}

/**
 * Converts a function with `x` arguments into `x` functions with 1 argument.
 * @function curry
 * @param  {Function} func The function to curry.
 * @return {Function} Returns the new curried function.
 */
export function curry(fn) {
  return function(...args) {
    return fn.bind(null, ...args)
  }
}

/**
 * Checks if `obj` is an empty object, collection, map, or set.
 * @function isEmpty
 * @param  {Object} obj The value to check.
 * @return {Boolean} true if the objectis empty, false otherwise.
 */
export function isEmpty(obj) {
  if (!obj) {
    return true
  }

  return !Object.keys(obj).length
}

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 * @function get
 * @param  {Object} obj The object to query.
 * @param  {string} path The path of the property to get.
 * @param  {*} defaultValue The value returned for `undefined` resolved values.
 * @return {*} Returns the resolved value.
 */
export function get(obj, path, defaultValue) {
  const result = path.split('.').reduce((r, p) => {
    if (typeof r === 'object' && r !== null) {
      p = cleanIndexInpath(p)

      return r[p]
    }

    return undefined;
  }, obj)

  return result === undefined ? defaultValue : result
}

/**
 * Returns an object omitting some keys.
 * @function omit
 * @param  {Object} obj The object to query.
 * @param  {string[]} paths The property paths to omit.
 * @return {Object} Returns the object with omitted keys.
 */
export function omit(obj, paths) {
  if (obj === null) {
    return null
  }

  if (!obj) {
    return obj
  }

  if (typeof obj !== 'object') {
    return obj
  }

  const buildObj = (obj, paths, _path = '', _result) => {
    const result = !_result ? Array.isArray(obj) ? [] : {} : _result

    for (const [key, value] of Object.entries(obj)) {
      if (paths.includes(key)) {
        continue
      }

      if (typeof value === 'object' && value !== null) {
        result[key] = buildObj(
          value,
          paths,
          `${_path}${key}.`,
          Array.isArray(value) ? [] : {}
        )
      } else {
        result[key] = value
      }
    }

    return result
  }

  return buildObj(obj, getObjectPaths(paths))
}

/**
 * Creates an object composed of the picked `obj` properties.
 * @function pick
 * @param  {Object} obj The source object.
 * @param  {string[]} paths The property paths to pick.
 * @return {Object} Returns the new object.
 */
export function pick(obj, paths) {
  const result = {}

  for (const path of getObjectPaths(paths)) {
    const value = get(obj, path)
    if (value) {
      set(result, path, value)
    }
  }

  return result
}


/**
 * Sets the value at `path` of `object`. If a portion of `path` doesn't exist,
 * it's created.
 * @function set
 * @param  {Object} obj The object to modify.
 * @param  {string} path The path of the property to set.
 * @param  {*} val The value to set.
 * @return {type} {description}
 */
// inspired by https://github.com/lukeed/dset
export function set(obj, path, val) {
  path.split && (path = path.split('.'))
  let i = 0
  const l = path.length
  let t = obj
  let x
  let k
  while (i < l) {
    k = path[i++]
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') break
    t = t[k] =
      i === l
        ? val
        : typeof (x = t[k]) === typeof path && t[k] !== null
          ? x
          : path[i] * 0 !== 0 || !!~('' + path[i]).indexOf('.')
            ? {}
            : []
  }
}

/**
 *  Clones an object recursively, preserving inheritance.
 * @function cloneDeep
 * @param  {Object} obj The object to recursively clone.
 * @return {Object} Returns the deep cloned object.
 */
export function cloneDeep(obj) {
  return mergician({}, obj)
}

/**
 * Merges `obj2` within `obj1`.
 * @function merge
 * @param  {Object} obj1 The first object to merge.
 * @param  {Object} obj2 The second object to merge.
 * @return {Object} The merged object.
 */
export function merge(obj1, obj2) {
  return mergician(obj1, obj2)
}

export async function fileExists(path) {
  try {
    await fs.access(path)
    return true
  } catch(_) {
    return false
  }
}
