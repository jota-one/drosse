# Customize response

## Throttle
A must have feature if you want to detect your race condition and test your lovely loading animations. You can throttle any endpoint by adding the `throttle` configuration object into it. Just like this:

```json
{
  "api": {
    "users": {
      "DROSSE": {
        "get": {
          "throttle": {
            "min": 1000,
            "max": 2000
          }
        },
        "post": {}
      },
      ":id": {
        "DROSSE": {
          "get": {}
        }
      }
    }
  }
}
```

In the example above, the route `GET /api/users` will be throttled between 1 and 2 seconds (randomly chosen in the boundaries).

?> Of course, you can put your throttle at any level of your routes tree and it will be inherited in all the sub routes that don't have their own `throttle` configuration.

```json
{
  "api": {
    "DROSSE": {
      "throttle": {
        "min": 5000,
        "max": 10000
      }
    },
    "users": {
      "DROSSE": {
        "get": {
          "throttle": {
            "min": 1000,
            "max": 2000
          }
        },
        "post": {}
      },
      ":id": {
        "DROSSE": {
          "get": {}
        }
      }
    }
  }
}
```

Here all the routes under `/api` will be throttled between 5 and 10 seconds, except the `GET /api/users` that keeps its own 1-2 seconds throttling.

## Proxy
In Drosse, proxies let you escape from your mock-server for a while. How does it work ?

Anywhere in your routes `tree`, you can define a proxy (inside the `DROSSE` object, like always). All the routes matching the path where your proxy is defined, but NOT matching a subsequent route will be proxied to... your proxy. Okay this sentence is really f***-up. Let's have a look to the `routes.json`.

```json
{
  "api": {
    "users": {
      "DROSSE": {
        "get": {
          "throttle": {
            "min": 1000,
            "max": 2000
          }
        },
        "post": {}
      },
      ":id": {
        "DROSSE": {
          "get": {}
        }
      }
    },
    "countries": {
      "DROSSE": {
        "proxy": "https://restcountries.com/v3.1"
      }
    }
  }
}
```

In the above example, any request made on `http://localhost:8000/api/countries` will be done instead on `https://restcountries.com/v3.1`. The subsequent path will be applied as well.

So `http://localhost:8000/api/countries/name/indonesia` will be proxied to `https://restcountries.com/v3.1/name/indonesia` and return the expected result.

Of course you can still define subroutes in a proxied path. They will take precedence on the proxy. Let's change our `countries` block like this:

```json
    "countries": {
      "DROSSE": {
        "proxy": "https://restcountries.com/v3.1"
      },
      "name": {
        "switzerland": {
          "DROSSE": {
            "get": {
              "body": {
                "name": "Switzerland",
                "description": "Best country in the World!"
              }
            }
          }
        }
      }
    }
```

If we call `http://localhost:8000/api/countries/name/switzerland`, Drosse will not proxy the request as there is a fully qualified path in our routes definition. We will then get the response defined just above and not a proxied response.

### Advanced proxy settings
If you need advanced proxy settings, you can use an object instead of a string, like this:
```json
    "countries": {
      "DROSSE": {
        "proxy": {
          "target": "https://localhost:8081/api",
          "secure": false,
          "ws": true
        }
      }
```

As we use [node-http-proxy](https://www.npmjs.com/package/http-proxy) in the background, please refer to its documentation for [all available options](https://github.com/http-party/node-http-proxy#options).

## Templates
A small yet very handsome feature. Templates help you to DRY your mocked endpoints. In Drosse, a template is a simple function that takes a content and transforms it to something else. Let's take an example:

```json
{
  "api": {
    "DROSSE": {
      "template": "response"
    },
    "products": {
      "v1": {
        "DROSSE": {
          "template": "responseV1"
        }
      }
    },
    "other": {},
    "routes": {}
  }
}
```

When passing a `template` to a node, you tell Drosse to apply this template to all endpoint results from this node path and all subnodes. Except if you redefine another template. In that case it will take precedence. In our example, any call to `/api`, `/api/products`, `/api/other` or `/api/routes` will have their response passed to the `response` template. But a call to `/api/products/v1` will have its response passed to `responseV1` template.

To use a template, you need to create a JS file, store it somewhere in your `[mocks root]` directory and reference it in your `.drosserc.js` file. Here is an example of `.drosserc.js` file with our 2 templates registered:

```js
// .drosserc.js
const response = require('./templates/response')
const responseV1 = require('./templates/responseV1')

module.exports = {
  name: 'My awesome app',
  port: 8004,
  templates: { response, responseV1 }
}
```

Here we stored the templates in a `templates` directory, but you can load them from wherever you prefer. You simply need to register each template function in a `templates` property.


Here is how the `response` and `responseV1` template could look like:

```js
// response.js
module.exports = function (response) {
  return {
    version: 'v2',
    data: response
  }
}
```

```js
// responseV1.js
module.exports = function (response) {
  return {
    version: 'v1',
    ...response
  }
}
```

You can also use these templates to perform intermediate transformations in your services (see [Dynamic mocks](dynamic-mocks.md)) as they are also simple JS functions...

?> You need to register your templates in the `.drosserc.js` file only if you want to use them in the `routes.json` file.