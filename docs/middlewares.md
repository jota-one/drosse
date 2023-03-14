# Middlewares

You can create your own middlewares. Simply create a JS file that exports an
h3 event handler like this:

```js
export default event => {
  // put your middleware code here
  return { smth: 'cool' }
}
```

Of course you can use `async` as well in your handler.
[https://github.com/unjs/h3](Refer to the h3 documentation for more details).

You can also use "old" express-like middlewares (typically if you're using an
epxress-based middleware package) using the `fromNodeMiddleware` utility function
from h3:

```js
import { fromNodeMiddleware } from 'h3'

export default fromNodeMiddleware((req, res, next) => {
  // put your middleware code here
  req.setHeader('x-smth', 'cool')
  next()
})
```

## Use Drosse API in your middleware

Alternatively you can define your middleware with a supplementary argument,
to place at the first position. It will expose the Drosse API inside your
middleware, letting you access the `db` instance for example:

```js
import { getRouterParams } from 'h3'

export default (api, event) => {
  // (very) naive role checking :)
  const { db } = api
  const user = db.get.byId('users', getRouterParams(req).id)
  if (user.role !== 'admin') {
    return { some: 'error' }
  }
  return
}
```
