# Middlewares

You can create your own middlewares. Simply create a JS file that exports a classic express middleware function. Something like this:

```js
module.exports = function (req, res, next) {
  // put your middleware code here
  next()
}
```

You can also define the middleware with a supplementary argument, to place at the first position. It will
expose the Drosse API inside your middleware, letting you access the `db` instance for example.

```js
module.exports = function (api, req, res, next) {
  // (very) naive role checking :)
  const { db } = api
  const user = db.get.byId('users', req.params.id)
  if (user.role !== 'admin') {
    return next({ some: 'error'})
  }
  next()
}
```

?> As of version 3.0.0, you can write middlewares "the h3 way" without the `next`
callback. Note that h3 supports express middlewares anyways.
[https://github.com/unjs/h3](Please refer to the h3 documentation for more details).

```js
const { getRouterParams } = require('h3')

module.exports = function (api, req, res, next) {
  // (very) naive role checking :)
  const { db } = api
  const user = db.get.byId('users', getRouterParams(req).id)
  if (user.role !== 'admin') {
    return { some: 'error'}
  }
  return
}
```

