# Dynamic mocks (services)

With the services, we cross some sort of line between pure mocking and an actual alternative backend for our frontend app. But sometimes it can be really useful. For example when you want to test interactivity in your app, or you don't have the backend yet because you're on a big project with separated teams and the backend  will be implemented after the frontend, but you still have to deliver a working frontend at the same time as the backend, etc.

> Drosse provides everything you need to implement an interactive mocked backend and let you focus on your frontend usecases.

To define a service, you have to do pretty much the same as to define a static mock. Look at this example where we replace the previous "POST users" inline mock by a service:

```json
{
  "api": {
    "users": {
      "DROSSE": {
        "get": {
          "body": [
            {"id": 1, "name": "Jorinho", "premium": false},
            {"id": 2, "name": "Tadai", "premium": true}
          ]
        },
        "post": {
          "service": true
        }
      },
      ":id": {
        "DROSSE": {
          "get": {
            "static": true
          }
        }
      }
    }
  }
}
```

See ? From the `routes.json` file, it's quite a piece of cake :cake: !

Now of course, there is no magic (yet!) here. You have to create a file with the proper name and put it in the `services` subdirectory of your mocks directory.

?> Like for the others subdirectories, you can redefine this `services` directory name in your `.drosserc.js` file (see [Configuration](configuration.md)).

To name your file, the rule is even simpler as for the static files. Here you just take in account the non-parameter nodes of your route path. In our case we don't have any parameter node. Our `POST /api/users` route will resolve into a `api.users.post.js` service file.

Let's just take another example to make it clear. For example for a `PUT /api/users/:id/superpowers/:name` the service file will be `api.users.superpowers.put.js`.

Now let's have a look inside these service files.

## The service file
A service file must export a function that takes one object argument.

```js
module.exports = function ({ req, res, db }) {
  // a lot of cool stuffs...
}
```

?> In esm mode (as of version 3.1.0) you would define your service like so:
```js
export default function ({ req, res, db }) {
  // a lot of cool stuffs...
}
```
or with a lambda function:
```js
export default ({ req, res, db }) => {
  // a lot of cool stuffs...
}
```
or async:
```js
export default async ({ req, res, db }) => {
  // a lot of cool stuffs...
}
```

?> As of version 3.1.0 you can use the `defineDrosseService` utility function
which provides typing:

in commonjs mode:
```js
const { defineDrosseService } = require('@jota-one/drosse')

module.exports = defineDrosseService(function ({ req, res, db }) {
  // a lot of cool stuffs...
})
```

in esm mode (with async for example):
```js
import { defineDrosseService } from '@jota-one/drosse'

export default defineDrosseService(async ({ req, res, db }) => {
  // a lot of cool stuffs...
})
```

As you can see, the object argument gives you access to the well known `req` and `res` objects. With those two and the full power of javascript, you can already do more than what you will ever need in a mock-server.

?> The return value of your function will be passed to the associated route response (optionally modified by a [template](customize-response.md#templates)</a>).

Let's take a full example.

1. You call `POST /api/users` and pass this payload: `{ name: "John" }`.
2. The function in the file `services/api.users.post.js` is executed.
3. Let's say it contains this code:


```js
module.exports = function ({ req, res, db }) {
  const payload = req.body
  // do whatever you want with your payload
  return { added: payload.name }
}
```

!> As of version 3.0.0 you have to use the `readBody` utility of
[h3](https://github.com/unjs/h3) like this:

```js
const { readBody } = require('h3')

module.exports = async function ({ req, res, db }) {
  const payload = await readBody(req)
  // do whatever you want with your payload
  return { added: payload.name }
}
```

or in esm mode:
```js
import { readBody } from 'h3'

export default async function ({ req, res, db }) {
  const payload = await readBody(req)
  // do whatever you want with your payload
  return { added: payload.name }
}
```

4. Your call returns: `{ added: "John" }`.
5. That's all folks!

?> But there is more! The `db` object gives you access to the embedded Drosse database and its super-fancy API. This part requires a full chapter.