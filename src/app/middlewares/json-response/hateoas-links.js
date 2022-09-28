import { get, set } from '../../../helpers'

const rewriteLinks = links => links.map(link => {
  // if the link href starts with a fully qualified URL, we remove the domain
  // the goal is that the URL starts just with /path/to/endpoint
  let { href } = link

  if (href.indexOf('http') === 0) {
    href = `/${href.split('/').slice(3).join('/')}`
  }

  return { ...link, href }
})

const walkObj = (root = {}, prefix = '') => {
  if (typeof root !== 'object') {
    return root
  }
  
  const obj = (prefix ? get(root, prefix) : root) || {}

  Object.entries(obj).forEach(([ key, value ]) => {
    const path = `${prefix && prefix + '.'}${key}`

    if (key === 'links') {
      const linkKeys = Object.keys(value[0] || [])
      
      if (linkKeys.includes('href') && linkKeys.includes('rel')) {
        set(root, path, rewriteLinks(value))
      } else {
        walkObj(root, path)
      }
    }
    
    walkObj(root, path)
  })
}

export default function (body) {
  walkObj(body)
  return body
}
