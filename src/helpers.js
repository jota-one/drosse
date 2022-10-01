// inspired by https://github.com/lukeed/dset
export function set (obj, path, value) {
  path.split && (path = path.split('.'))
  let i = 0, l = path.length, t = obj, x, k
  while (i < l) {
    k = path[i++]
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') break;
    t = t[k] = (i === l) ? value : (typeof (x = t[k]) === typeof (path)) ? x : (path[i] * 0 !== 0 || !!~('' + keys[i]).indexOf('.')) ? {} : [];
  }
}

export function get (obj, path, defaultValue) {
  const result = path.split('.').reduce((r, p) => {
    if (typeof r === 'object' && r !== null) {
      p = p.startsWith("[") ? p.replace(/\D/g, "") : p;

      return r[p]
    }

    return undefined;
  }, obj)

  return result === undefined ? defaultValue : result
}