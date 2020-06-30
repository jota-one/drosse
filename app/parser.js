const parse = (app, routes, root = []) => {
  if (routes._get) {
    app.get('/' + root.join('/'), (req, res, next) => {
      res.send(routes._get.body)
    })
    console.log('created a GET route', '/' + root.join('/'))
  }
  if (routes._post) {
    app.post('/' + root.join('/'), (req, res, next) => {
      res.send({})
    })
    console.log('created a POST route', '/' + root.join('/'))
  }
  Object.entries(routes).map(([path, content]) => {
    // console.log(path, content)
    if (['_get', '_post'].includes(path)) {
      return
    }

    parse(app, content, root.concat(path))
  })
}

module.exports = {
  parse
}
