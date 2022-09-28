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
