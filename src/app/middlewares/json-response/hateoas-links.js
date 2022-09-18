export default function (body) {
  if (body.data && body.data.links) {
    body.data.links = body.data.links.map(({ rel, href }) => {
      // if the link href starts with a fully qualified URL, we remove the domain
      // the goal is that the URL starts just with /path/to/endpoint
      if (href.indexOf('http') === 0) {
        href = `/${href.split('/').slice(3).join('/')}`
      }
      return { rel, href }
    })
  }
  return body
}
