import { get, set } from '../../../helpers'

const rewriteLinks = links => Object.entries(links).reduce((links, [ key, link ]) => {
  // if the link href starts with a fully qualified URL, we remove the domain
  // the goal is that the URL starts just with /path/to/endpoint
  let { href } = link

  if (href.indexOf('http') === 0) {
    href = `/${href.split('/').slice(3).join('/')}`
  }

  links[key] = { ...link, href }

  return links 
}, {})

const walkObj = (root = {}, prefix = '') => {
  if (typeof root !== 'object') {
    return root
  }

  const obj = (prefix ? get(root, prefix) : root) || {}

  Object.entries(obj).forEach(([key, value]) => {
    const path = `${prefix && prefix + '.'}${key}`

    if (key === '_links') {
      set(root, path, rewriteLinks(value))
    }

    walkObj(root, path)
  })
}

export default function (body) {
  walkObj(body)
  return body
}
