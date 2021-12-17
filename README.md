<img src="https://raw.githubusercontent.com/jota-one/drosse/master/Drosse.svg" style="width:350px;max-width:100%;margin: 25px 0;"/>

## What is it ?
> Drosse is the last mock server you'll ever need.

## Table of contents
* [Installation](#installation)
* [Usage](#usage)
    * [As npm dependency in your node project](#as-npm-dependency-in-your-node-project)
    * [As a global npm package](#as-a-global-npm-package)
    * [As a Docker image](#as-a-docker-image)
* [The routes.json file](#the-routesjson-file)
    * [The DROSSE object](#the-drosse-object)
    * [Throttling](#throttling)
    * [Proxies](#proxies)
        * [Advanced proxy settings](#advanced-proxy-settings)
    * [Assets](#assets)
    * [Templates](#templates)
* [Inline mocks](#inline-mocks)
* [Static mocks (in separated files)](#static-mocks-in-separated-files)
* [Services (aka dynamic mocks)](#services-aka-dynamic-mocks)
    * [The service file](#the-service-file)
* [Drosse db API](#drosse-db-api)
    * [Identify your documents](#identify-your-documents)
    * [Reference documents](#reference-documents)
    * [API](#api)
* [The .drosserc.js file (configure your Drosse)](#the-drossercjs-file-configure-your-drosse)
    * [All configuration keys](#all-configuration-keys)
    * [Custom middlewares](#custom-middlewares)
* [Endpoints scraping](#endpoints-scraping)
    * [Static scraping](#static-scraping)
    * [Dynamic scraping](#dynamic-scraping)
* [The CLI](#the-cli)
* [Features](#features)
* [In progress](#in-progress)
* [Future features](#future-features)

## Installation
### As [npm](https://www.npmjs.com/package/@jota-one/drosse) dependency in your node project

1. Simply install it as a dev dependency of the project you want to mock.
```
npm install --save-dev @jota-one/drosse
```
2. Define a script in your `package.json` file for simpler usage
```json
{
  "name": "my-node-project",
  "scripts": {
    "mock-server": "npx drosse serve path/to/mocks-directory"
  },
  "devDependencies": {
    "@jota-one/drosse": "^1.0.0"
  }
}
```

### As a global [npm](https://www.npmjs.com/package/@jota-one/drosse) package
1. Install drosse globally.
```
npm i -g @jota-one/drosse
```

2. Run it via the `serve` command and your drosse folder as root via the `-r` param or directly as a value after the `serve` command.
```
drosse serve -r /path/to/my/my/mocks
```
or
```
drosse serve /path/to/my/my/mocks
```

### As a [Docker image](https://hub.docker.com/r/jotaone/drosse)
You can use a docker image if you don't want to install nodejs runtime on your machine.
**Note** though that you'll have to map your local folder to the container's `data` volume as well as the  port your drosse is configured on.

1. Pull the docker image on your computer
```
docker pull jotaone/drosse
```

2. Run the container and map your mocks' path and port
```
docker run -v /path/to/my/mocks:/data -p 8000:8000 jotaone/drosse
```


## Usage
You need a directory where you will store all your mocks definitions.
1. Create a directory anywhere in your project repository (or anywhere else).
2. Update the `package.json` script you just added in the Installation phase to target your new mocks directory.
3. In your mocks directory, create a `routes.json` file. This file will hold every single mocked route of your server.
4. In the same directory, you can also create a `.drosserc.js` file. This file allows you to configure your mock server ([see below](#drosserc)). It's optional but you will very likely need it.

Yes there are a couple of things to do yourself. But you're a developer, right? You know how to edit a JSON file or a JS file. In the upcoming releases, we will add a CLI and a UI, don't worry!

Let's focus first on these 2 files.

## The routes.json file
This file is mandatory but you can customize its name in the `.drosserc.js` file ([see below](#drosserc)). This is where you define all the routes you want to mock. Each route is defined as a tree, with _slash_ as separator.

> :dizzy_face: Woot ? Tree ? Slash ? I just want to mock a couple of routes...

Ooook, an example worth a thousand sentences of bad explanation. Let's say you want to mock these 2 routes:

```
GET /api/users
GET /api/users/:id
```

You would create a _tree_ in your `routes.json` file like this:

```json
{
  "api": {
    "users": {
      ":id": {

      }
    }
  }
}
```

That's what we mean by "a tree". We consider that an API can be completely described in such a structure.

> :smirk: Okay, but where do the actual mocks go ? And if have a GET **AND** a POST on `/api/users` ?

Good questions, thanks for asking.

### The DROSSE object
That's where the `DROSSE` object comes in and saves our souls. Look at this:

```json
{
  "api": {
    "users": {
      "DROSSE": {
        "get": {},
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

Everything happens inside the `DROSSE` object. You can insert a `DROSSE` object anywhere in the tree. A `DROSSE` object can contain HTTP verbs, like in the above example and a couple of other keys (more on these later).

> :triumph: I WANT TO MOCK MY ROUTES!!! WHERE DO I PUT MY MOCKED CONTENTS???

There we go! You can mock your datas in 3 different ways:
1. directly inside the `routes.json` file, using the `body` key (see [inline mocks](#inline-mocks)).
2. in a static JSON file with a constrained name (see [Static mocks](#static-mocks))
3. in a dynamic JS file (we consider it a service) with a constrained name (see [Services](#dynamic-mocks))

But before we move to the mock contents, let's have a look to the other stuffs you can put into the `DROSSE` object.

### Throttling
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

:cherries: Of course, you can put your throttle at any level of your routes tree and it will be inherited in all the sub routes that don't have their own `throttle` configuration.

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

### Proxies

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
        "proxy": "https://restcountries.eu/rest/v2"
      }
    }
  }
}
```

In the above example, any request made on `http://localhost:8000/api/countries` will be done instead on `https://restcountries.eu/rest/v2`. The subsequent path will be applied as well.

So `http://localhost:8000/api/countries/name/indonesia` will be proxied to `https://restcountries.eu/rest/v2/name/indonesia` and return the expected result.

Of course you can still define subroutes in a proxied path. They will take precedence on the proxy. Let's change our `countries` block like this:

```json
    "countries": {
      "DROSSE": {
        "proxy": "https://restcountries.eu/rest/v2"
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

#### Advanced proxy settings

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

### Assets

You can use the `assets` property in the `DROSSE` object to tell a path to serve only static contents. Behind the scene, it will apply the `express.static` middleware to this path. Let's check the following example:

```json
{
  "content": {
    "DROSSE": {
      "assets": true
    },
    "imgs": {
      "background_*.jpg": {
        "DROSSE": {
          "assets": "content/images/background_mocked.png"
        }
      }
    }
  }
}
```

In this example, all calls done to `/content` will be done statically on the `assets/content` directory. For example, if you call `http://localhost:8000/content/fonts/myfont.woff2`, Drosse will look up for a file in `[your mocks root]/assets/content/fonts/myfont.woff2` and serve it statically.

The example reveals another feature: you can rewrite the path through the `assets` property. If you call `http://localhost:8000/content/imgs/background_whatever.jpg`, Drosse will statically serve the `[your mocks root]/assets/content/imgs/background_whatever.jpg` file.

:fire: You can redefine this `assets` directory name in your `.drosserc.js` file ([see below](#drosserc)).

<a name="templates"></a>
### Templates

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

You can also use these templates to perform intermediate transformations in your services (see [dynamic mocks section](#dynamic-mocks)) as they are also simple JS functions...

:fire: You need to register your templates in the `.drosserc.js` file only if you want to use them in the `routes.json` file.

<a name="inline-mocks"></a>
## Inline mocks

Let's focus first on the `body` key, by far the simplest but by far the less cool. If you calm down, you'll be allowed to know about the 2 other solutions. Here's how you can mock your routes with inlined mocks.

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
          "body": {"success": true}
        }
      },
      ":id": {
        "DROSSE": {
          "get": {
            "body": {"id": 1, "name": "Jorinho", "premium": false}
          }
        }
      }
    }
  }
}
```

The above JSON is a fully working `routes.json` file. If you run your mock-server with this file, you will see something like this in your console (amongst other things):

```bash
4:26:27 PM -> GET     /api/users/:id
4:26:27 PM -> GET     /api/users
4:26:27 PM -> POST    /api/users

4:26:27 PM App Example JSON app running at:
4:26:27 PM  - http://localhost:8000
```

Note that the routes are defined in the right order to make sure that a less precise route won't take over a more precise one. Let's create a new route to illustrate this better:

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
          "body": {"success": true}
        }
      },
      ":id": {
        "DROSSE": {
          "get": {
            "body": {"id": 1, "name": "Jorinho", "premium": false}
          }
        }
      },
      "premiums": {
        "DROSSE": {
          "get": {
            "body": [{"id": 2, "name": "Tadai"}]
          }
        }
      }
    }
  }
}
```
We defined a new route corresponding to this one `GET /api/users/premiums`. Of course, if Drosse was stupid it would define it in the same order as what we did in the `routes.json` file, which would make the route unreachable, because it would always be captured by the `GET /api/users/:id`, passing "premiums" as the `:id` parameter. Let's see what happens if we reload our mock server.

```bash
4:40:59 PM -> GET     /api/users/premiums
4:40:59 PM -> GET     /api/users/:id
4:40:59 PM -> GET     /api/users
4:40:59 PM -> POST    /api/users

4:40:59 PM App Example JSON app running at:
4:40:59 PM  - http://localhost:8000
```

:tada::tada::tada: The `/premiums` route was declared before the generic `/:id` route! Conclusion: you don't have to worry about sorting your routes when you define them inside `routes.json`.

> :open_mouth: That's awesome! It calmed me down totally... I'm ready to know more about the 2 other ways to mock my stuffs!

<a name="static-mocks"></a>
## Static mocks (in separated files)

As you've probably noticed, the inline mocks are not that dynamic... For instance, if we take the `GET /api/users/:id` route, you can call it with any value for `:id`, you will always get the same response. Although it can be enough for most usecases, sometimes we want a little bit more.

That's where the so-called static mocks can help you. Where you have only one mock possibility with the inline (`body`) mock even for parametrized routes, static mocks offer you the possibility to have a different mock for each value of each parameter!

That is why these mocks are stored in separated files. It would otherwise bloat your `routes.json` file.

To define a `static mock`, simply set the `static` property of your `DROSSE` object to `true`. Let's take the previous example and replace the parametrized route inline mock by a static mock:

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
          "body": {"success": true}
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

With such a definition, when you call `GET /api/users/65?withDetails=1`, drosse will look for a specific JSON file in the `static` subdirectory of your mocks directory.

:fire: You can redefine this `static` directory name in your `.drosserc.js` file ([see below](#drosserc)).

Drosse will look for different filenames, from the more precise to the more generic until it finds one that matches. Let's keep the above example and see which filenames will be looked for:

```
api.users.65.get&&withDetails=1.json
api.users.65.get.json
api.users.65.json
api.users.{id}.json
```

If you have a route with several path parameters, drosse will ignore them from left to right. Example, for this route:
```
GET /api/users/:id/posts/:type
```

Assuming that you have 2 types of posts, `unread` and `read` and a big quantity of users, it's more convenient to be able to define a mocked list of `read` posts and another mocked list of `unread` posts, independently of the user. For that usecase you can then create only 2 files in your `static` directory:

```
api.users.{id}.posts.read.get.json
api.users.{id}.posts.unread.get.json
```

:fire: If you are not sure of the precedence for a given route, just try and check the drosse console. It will log each failed attempts.

If we try to call `GET /api/users/3` and we have defined the following static mocks files in our `static` directory.

```
api.users.1.json
api.users.2.json
api.users.{id}.json
```

```bash
1:11:29 AM App Example JSON static app running at:
1:11:29 AM  - http://localhost:8000
1:11:29 AM  - http://172.22.22.178:8000

1:11:29 AM Mocks root: /some/path/mymocks

1:17:27 AM loadStatic: tried with [/some/path/mymocks/static/api.users.3.get.json]. File not found.
1:17:27 AM loadStatic: tried with [/some/path/mymocks/static/api.users.3.json]. File not found.
1:17:27 AM loadStatic: tried with [/some/path/mymocks/static/api.users.{id}.get.json]. File not found.
```
You can see above that the system has first tried with the most precise `api.users.3.get.json` (resolved parameter + verb). Then it tries the same without verb (`api.users.3.json`). As it still fails, it tries without resolving the parameter, but again with the verb (`api.users.{id}.get.json`) and finally find a corresponding mock file with `api.users.{id}.json`. Of course this last one is not logged as it was found.

:bulb: if Drosse really doesn't find any file corresponding to the requested endpoint, it will give an ultimate look in the `scraped` static files. More on this in the __endpoints scraping__ dedicated section ([-> right here](#endpoints-scraping)).

<a name="dynamic-mocks"></a>
## Services (aka dynamic mocks)

With the services, we cross some sort of line between pure mocking and an actual alternative backend for our frontend app. But sometimes it can be really useful. For example when you want to test interactivity in your app, or you don't have the backend yet because you're on a big project with separated teams and the backend  will be implemented after the frontend, but you still have to deliver a working frontend at the same time as the backend, etc.

Drosse provides everything you need to implement an interactive mocked backend and let you focus on your frontend usecases.

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

:fire: Like for the others subdirectories, you can redefine this `services` directory name in your `.drosserc.js` file ([see below](#drosserc)).

To name your file, the rule is even simpler as for the static files. Here you just take in account the non-parameter nodes of your route path. In our case we don't have any parameter node. Our `POST /api/users` route will resolve into a `api.users.post.js` service file.

Let's just take another example to make it clear. For example for a `PUT /api/users/:id/superpowers/:name` the service file will be `api.users.superpowers.put.js`.

Now let's have a look inside these service files.

### The service file

A service file must export a function that takes one object argument.

```js
module.exports = function ({ req, res, db }) {
  // a lot of cool stuffs...
}
```

As you can see, the object argument gives you access to the well known `req` and `res` objects from Express. With those two and the full power of javascript, you can already do more than what you will ever need in a mock-server.

:star: The return value of your function will be passed to the associated route response (optionally modified by a template, see later).

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

4. Your call returns: `{ added: "John" }`.
5. That's all folks!

:fire: But there is more! The `db` object gives you access to the embbedded Drosse database and its super-fancy API. This part requires a full chapter.

## Drosse db API

Drosse leverages [LokiJS](https://github.com/techfort/LokiJS) power to allow stateful interactive mocking. But don't worry, no need for database configuration or any complicated stuffs. Basically, LokiJS is a nosql document database (a bit like mongo, but way simpler).

When you start your mock server for the first time, Drosse will create a database and store it in a `mocks.json` file in your `[mocks root]` directory. Yes! You've read it, it's a simple JSON file. You can open it in your IDE and see the content of your database. But don't modify it manually, it will probably break the database. To be precise, LokiJS is a in-memory database and it will simply dump its content every 4 seconds in the `mocks.json` file.

> :anguished: How do I update it, then ?

LokiJS is collections-based. You can consider each collection as an array of objects, each object being a document.

To provide some contents to your database, you need to create a `collections` directory in your `[mocks root]` directory. In this directory you will define your collections. A collection can be either:

- A directory that contains JSON files. These files must contain a JSON object (not an array).
- A JSON files that must contain an array of objects.

In the end it's the same. Drosse will process either the directory or the big JSON file and insert it as a new collection full of documents in your database.

:fire: You can redefine the `mocks.json` database file and the `collections` directory name in your `.drosserc.js` file ([see below](#drosserc)).

By default, on each startup Drosse will check the `collections` directory and see if the collection already exists in the database. If not, it will import it. If the collection already exists, Drosse won't import it again; even if you added new files in the collection directory.

If you want a fresh database, simply delete the `mocks.json` file and restart Drosse.

> :sweat_smile: That's a bit violent! Is there a smoother way?

You ask it, we provide.

You can define a `shallowCollections` key in your `.drosserc.js` file. It must contain an array with collection names. All the collections listed in this array will be overriden on each Drosse startup.

<a name="db-identify"></a>
### Identify your documents
One more thing. To make Drosse aware of how you identify each of your document, you should provide in each document a `DROSSE` property which contains an `ids` property, which itself contains a list of what you consider the document identifiers.

It can be very useful to have different identifiers for your documents. As the identifiers don't have to be unique, it's not an issue. Don't forget that Drosse is a mock server. You aim to mock a real system that lives somewhere out there. And in the real world, it happens often that the same entity is retrieved through different ways. Imagine a Project entity. It could be retrieved by its unique ID, but maybe also by a customer unique code or whatever else.

The real backend has probably different methods to fetch the project accordingly. But here we want to be fast and we don't care about all that. So we can store all the potential identifiers of a document in our `DROSSE.ids` array. It will look like this:

```json
{
  "id": 1980,
  "name": "Construction of a skyscraper",
  "customer": {
    "id": 888,
    "name": "ACME corp",
    "projectCode": "SKYSCRAPER-999"
  },
  "budget": 98000000,
  "DROSSE": {
    "ids": [1980, "SKYSCRAPER-999"]
  }
}
```
Like this, it will be easier to find our document and we won't have to ask ourselves which identifier was sent to our service.

<a name="db-ref"></a>
### Reference documents
In the above example we have a customer inside a project. But what if we want to list all the customers in our app ? We could duplicate the customer informations into a `customers` collection, but that would mean that the customer's informations displayed in the project document are duplicated. Not good to maintain our mocks...

Here come reference documents to the rescue!

Assuming you have a `customers` collection with this customer document in it.

```json
{
  "id": 888,
  "name": "ACME corp",
  "address": {
    "street": "Undefined or null 1",
    "zip": "00001",
    "town": "North Pole City"
  },
  "activity": "Secretely conquer the world by not being evil... at first.",
  "DROSSE": {
    "ids": [1980, "SKYSCRAPER-999"]
  }
}
```

You can redefine your project like this:

```json
{
  "id": 1980,
  "name": "Construction of a skyscraper",
  "customer": {
    "collection": "customers",
    "id": 888,
    "projectCode": "SKYSCRAPER-999"
  },
  "budget": 98000000,
  "DROSSE": {
    "ids": [1980, "SKYSCRAPER-999"]
  }
}
```

The company name is not duplicated anymore.

When you've fetched the project document, you can easily query the linked customer by calling the [`db.get.byRef()`](#db-get-byRef) method and pass it the `project.customer` object. Drosse will return the corresponding customer document. You can then overwrite `project.customer` with this result.


### API

Once your documents are stored in the database, here is how you can query them or even dynamically insert new documents programmatically. As you've maybe already read above in the [dynamic mocks section](#dynamic-mocks), when you define a service function, it takes an object as argument and this object contains a `db` property. This `db` property exposes the whole Drosse DB API. Let's have a look to it in detail.

<a name="db-list-all"></a>
**db.list.all(collection, cleanFields)**

List all documents in a collection.
| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | _Required_ | String    | The collection name             |
| cleanFields             | _Optional_ | Array     | A list of properties you want to exclude from each returned document                 |

Returns an _Array_ of documents.

<a name="db-list-byId"></a>
**db.list.byId(collection, id, cleanFields)**

List all documents in a collection that have the provided identifier.
| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | _Required_ | String    | The collection name             |
| id                      | _Required_ | Mixed     | A [document identifier](#db-identify)                |
| cleanFields             | _Optional_ | Array     | A list of properties you want to exclude from each returned document                 |

Returns an _Array_ of documents.

<a name="db-list-byFields"></a>
**db.list.byFields(collection, fields, value, cleanFields)**

List all documents in a collection having at least one of the provided fields that contains the provided value.
| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | _Required_ | String    | The collection name             |
| fields                  | _Required_ | String[]  | A list of fields                |
| value                   | _Required_ | Mixed     | A value to test for. Should be a string or number               |
| cleanFields             | _Optional_ | Array     | A list of properties you want to exclude from each returned document                 |

Returns an _Array_ of documents.

<a name="db-list-byField"></a>
**db.list.byField(collection, field, value, cleanFields)**

List all documents in a collection having the provided field that contains the provided value.
| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | _Required_ | String    | The collection name             |
| field                   | _Required_ | String    | A field                         |
| value                   | _Required_ | Mixed     | A value to test for. Should be a string or number               |
| cleanFields             | _Optional_ | Array     | A list of properties you want to exclude from each returned document                 |

Returns an _Array_ of documents.

<a name="db-list-find"></a>
**db.list.find(collection, query, cleanFields)**

List all documents in a collection matching the provided query.
| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | _Required_ | String    | The collection name             |
| query                   | _Required_ | Object    | A lokiJS query object           |
| cleanFields             | _Optional_ | Array     | A list of properties you want to exclude from each returned document                 |

Returns an _Array_ of documents.

<a name="db-list-where"></a>
**db.list.where(collection, searchFn, cleanFields)**

List all documents in a collection for which the searchFn callback returns a truthy value
| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | _Required_ | String    | The collection name             |
| searchFn                | _Required_ | Function  | A function that will be called for each document and take the document in argument.           |
| cleanFields             | _Optional_ | Array     | A list of properties you want to exclude from each returned document                 |

Returns an _Array_ of documents.

<a name="db-get-byId"></a>
**db.get.byId(collection, id, cleanFields)**

Find first document in a collection that have the provided identifier.
| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | _Required_ | String    | The collection name             |
| id                      | _Required_ | Mixed     | A [document identifier](#db-identify)                |
| cleanFields             | _Optional_ | Array     | A list of properties you want to exclude from each returned document                 |

Returns a document.

<a name="db-get-byFields"></a>
**db.get.byFields(collection, fields, value, cleanFields)**

Find first document in a collection having at least one of the provided fields that contains the provided value.
| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | _Required_ | String    | The collection name             |
| fields                  | _Required_ | String[]  | A list of fields                |
| value                   | _Required_ | Mixed     | A value to test for. Should be a string or number               |
| cleanFields             | _Optional_ | Array     | A list of properties you want to exclude from each returned document                 |

Returns a document.

<a name="db-get-byField"></a>
**db.get.byField(collection, field, value, cleanFields)**

Find first document in a collection having the provided field that contains the provided value.
| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | _Required_ | String    | The collection name             |
| field                   | _Required_ | String    | A field                         |
| value                   | _Required_ | Mixed     | A value to test for. Should be a string or number               |
| cleanFields             | _Optional_ | Array     | A list of properties you want to exclude from each returned document                 |

Returns a document.

<a name="db-get-find"></a>
**db.get.find(collection, query, cleanFields)**

Find first document in a collection matching the provided query.
| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | _Required_ | String    | The collection name             |
| query                   | _Required_ | Object    | A lokiJS query object           |
| cleanFields             | _Optional_ | Array     | A list of properties you want to exclude from each returned document                 |

Returns a document.

<a name="db-get-where"></a>
**db.get.where(collection, searchFn, cleanFields)**

Find first document in a collection for which the searchFn callback returns a truthy value
| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | _Required_ | String    | The collection name             |
| searchFn                | _Required_ | Function  | A function that will be called for each document and take the document in argument.           |
| cleanFields             | _Optional_ | Array     | A list of properties you want to exclude from each returned document                 |

Returns a document.

<a name="db-get-byRef"></a>
**db.get.byRef(refObj, dynamicId, cleanFields)**

Find first document in a collection matching the provided query.
| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| refObj                  | _Required_ | Object    | An object that contains a `collection` property and an `id` property. See [Ref documents](#db-ref) documentation.             |
| dynamicId               | _Optional_ | Mixed     | A [document identifier](#db-identify)           |
| cleanFields             | _Optional_ | Array     | A list of properties you want to exclude from each returned document                 |

Returns a document.

```js
const getDetailedProject = projectId => {
  const myProject = db.get.byId('projects', projectId)
  myProject.customer = db.get.byRef(myProject.customer)
  return myProject
}

const detailedProject = getDetailedProject(1980)
```

<a name="db-query-getMapId"></a>
**db.query.getMapId(collection, fieldname, firstOnly)**

Generate a hash to link a specific document field value to the document ids (or first id)
| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | _Required_ | String    | The collection name             |
| fieldname               | _Required_ | String    | A field                         |
| firstOnly               | _Optional_ | Boolean   | If `true`, will consider only the first `id` found in the `DROSSE.ids` array.                 |

Returns a correspondance hash with the chosen field value as key and the corresponding id as value.

:warning: Be aware that if the chosen `fieldname` hasn't unique values for each document in collection, the later documents will overwrite the formers.

<a name="db-query-chain"></a>
**db.query.chain(collection)**

Exposes the LokiJS chain method ([see LokiJS documentation](https://techfort.github.io/LokiJS/Collection.html) for more details)
| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | _Required_ | String    | The collection name             |

Returns a [LokiJS ResultSet](https://techfort.github.io/LokiJS/Resultset.html)

<a name="db-query-clean"></a>
**db.query.clean([...fields])**

Creates a cleaning function that will remove all listed fields from the passed object
| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| ...fields               | _Optional_ | ...String | Any number of fieldnames             |

Returns a function that takes a javascript Object as unique argument

:fire: Even if no fields are passed, the function will be configured to remove the `reseserved words` from Drosse and Loki, aka: $loki, meta and DROSSE.

:fire::fire: This function is used in all other methods to clean up the results and merges the optional `cleanFields` with the `reserved words`.

<a name="db-insert"></a>
**db.insert(collection, ids, payload)**

Inserts a document in a collection
| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | _Required_ | String    | The collection name             |
| ids                     | _Required_ | Array     | An array of identifiers for your new document (will be stored in `DROSSE.ids`)       |
| payload                 | _Required_ | Object    | The document               |

Returns the inserted document

<a name="db-update-byId"></a>
**db.update.byId(collection, id, newValue)**

Updates a document in a collection
| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | _Required_ | String    | The collection name             |
| id                      | _Required_ | Mixed     | One of the document identifiers (from `DROSSE.ids`)       |
| newValue                | _Required_ | Object    | A hash with keys being of type `field.subfield.subsubfield` ([lodash.set](https://lodash.com/docs#set) is used to apply the changes)              |

Returns _nothing_

<a name="db-update-subItem-append"></a>
**db.update.subItem.append(collection, id, subPath, payload)**

Insert (append) a new item in some of the identified document subItems list
| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | _Required_ | String    | The collection name             |
| id                      | _Required_ | Mixed     | One of the document identifiers (from `DROSSE.ids`)       |
| subPath                 | _Required_ | String    | A string of type `field.subfield.subsubfield` pointing to the field to alter       |
| payload                 | _Required_ | Object    | The sub item to insert              |

Returns _nothing_


<a name="db-update-subItem-prepend"></a>
**db.update.subItem.prepend(collection, id, subPath, payload)**

Insert (prepend) a new item in some of the identified document subItems list
| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | _Required_ | String    | The collection name             |
| id                      | _Required_ | Mixed     | One of the document identifiers (from `DROSSE.ids`)       |
| subPath                 | _Required_ | String    | A string of type `field.subfield.subsubfield` pointing to the field to alter       |
| payload                 | _Required_ | Object    | The sub item to insert              |

Returns _nothing_

<a name="db-update-byId"></a>
**db.remove.byId(collection, id)**

Removes (delete) a document from a collection
| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | _Required_ | String    | The collection name             |
| id                      | _Required_ | Mixed     | One of the document identifiers (from `DROSSE.ids`)       |

Returns _nothing_ or `false` if the document was not found.

<a name="drosserc"></a>
## The .drosserc.js file (configure your Drosse)
This file holds your mock server general configuration. It's optional as all its keys have default values. It must simply export a configuration object.

Here is a typical example of what it could contain.
```js
module.exports = {
  name: 'My mocks app',
  port: 8000
}
```

### All configuration keys
| Key                  | Default value | Description |
|----------------------|---------------|-------------|
| `name`               | **(empty)**       | The name of your app. Mostly used to recognize it in your console or in [drosse UI](https://github.com/jota-one/drosse-ui). |
| `port`               | **8000**          | The port on which your mock server will run.<br>If not specified in `.drosserc.js` and already in use, Drosse will use the next available port if finds (8001, 8002, etc.) |
| `baseUrl`            | **(empty)**       | The base URL (ex. http://my.domain.com) for the routes |
| `basePath`           | **(empty)**       | A prefix (ex. /api/v2) that will be added to each route path |
| `routesFile`         | **routes**        | Name of the routes definition file. |
| `collectionsPath`    | **collections**   | Relative path to the loki collections directory from your mocks directory. |
| `shallowCollections` | **[]**            | List of collections that should be recreated/overriden on each server restart. |
| `assetsPath`         | **assets**        | Relative path to the assets directory from your mocks directory. |
| `servicesPath`       | **services**      | Relative path to the services directory from your mocks directory. |
| `staticPath`         | **static**        | Relative path to the static files directory from your mocks directory. |
| `scraperServicesPath`| **scrapers**      | Relative path to the scraper services files directory from your mocks directory. |
| `scrapedPath`        | **scraped**       | Relative path to the scraped files directory from your mocks directory. |
| `database`           | **mocks.db**      | Name of your loki database dump file. |
| `dbAdapter`          | **LokiFsAdapter** | IO adapter to use for database persistence. |
| `middlewares`        | **['morgan']** | List of global middlewares. Drosse provides 2 built-in middlewares, 1 being added by default. The second one is 'open-cors'. |
| `templates`          | **{}**            | Templates to be used in `routes.json`. See [templates](#templates) documentation. |
| `errorHandler`       | **(empty)**       | A custom express error handler. Must be a function with the following signature: function (err, req, res, next) { ... } (see [express documentation](https://expressjs.com/en/guide/error-handling.html#the-default-error-handler)) |
| `configureExpress`   | **(empty)**       | Used to set custom instructions to the express app. Must be a function with the following signature: function ({ server, app, db }) {}. `server` being the node http.Server instance, `app` the express instance and `db` the [drosse db api](#drosse-db-api). |
| `onHttpUpgrade`      | **null**          | A function that initiates a websocket connection. This is happening once during HTTP protocol upgrade handshake. Must be a function with the following signature: function (request, socket, head) { ... }. |
| `commands`           | **(empty)**       | Used to extend Drosse CLI with custom commands. Must be a function with the following signature: function (vorpal, drosse) { ... }. See [the cli](#cli) documentation. |

### Custom middlewares

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

<a name="endpoints-scraping"></a>
## Endpoints scraping
Do you remember, back in the days, these webscrapers ? You just turn them on then browse a website and they will eventually save the whole website on your machine? Well Drosse provides something similar, but a little less brutal as you can define precisely which endpoint you would like to scrape.

:warning: Endpoint scraping come along with the `proxy` feature. You won't scrape your own defined mocks, right?

There are 2 ways to scrape your proxied endpoints responses. The `static` and the `dynamic`.

### Static scraping
The easiest one. Just indicate in your `routes.json` file, which endpoint you want to scrape.

```json
    "countries": {
      "DROSSE": {
        "proxy": "https://restcountries.eu/rest/v2"
      },
      "name": {
        "DROSSE": {
          "scraper": {
            "static": true
          }
        }
      }
    }
```
In the snippet above, we've told Drosse to scrape any call to the `.../countries/name/....` endpoint.

Concretely, it means that Drosse will copy & save the response of any of those calls into a static JSON file in the `scraped` directory of your `mocks`.

:fire: As usual, you can redefine this `scraped` directory name in your `.drosserc.js` file ([see above](#drosserc)).

This can be a convenient way to populate your mocks contents if the backend API already exists. Just configure your mocks to proxy the existing API and activate the scraper. When you have enought contents, remove the proxy and redefine your mocked routes as `static` mocks.

Ideally you would rework your scraped contents and create relevant `static` file mocks out of it, maybe add some `templates`, etc. But you can also let them as they are, in the `scraped` directory: Drosse will always fallback on this directory if it doesn't find any match in the `static` directory.

### Dynamic scraping
The dynamic scraping will let you rework the scraped content and save it exactly how and where you want to.

```json
    "countries": {
      "DROSSE": {
        "proxy": "https://restcountries.eu/rest/v2"
      },
      "name": {
        "DROSSE": {
          "scraper": {
            "service": true
          }
        }
      }
    }
```

In contrast with the Static scraping, you simply have to replace the `static` by `service`; see above.

When Drosse encounter that configuration, it will look for a dedicated scraper service in the `scrapers` directory. The file must be named accordingly with the scraped endpoint. It's the same logic as for the normal `services` naming. You take each route node, remove the path parameters and replace `/` with `.`. And you ignore the verb.

If we take the same example as for the services. For a `GET /api/users/:id/superpowers/:name` the scraper service file will be `api.users.superpowers.js`. No parameters, no verb.


:fire: As always, the scrapers directory can be renamed in the `.drosserc.js` file, with the `scraperServicesPath` property ([see above](#drosserc)).

Your service must export a function which takes 2 parameters. The first one is the response of your scraped endpoint. It will be a JS object. The second one is the same `api` object as the one you get in a normal Drosse service.

This gives you then access to the `db` object, the whole drosse `config` object, the `req`, etc...

```js
module.exports = function (json, { db, config, req }) {
  // rework your json
  // save it in the database
  // create a proper JSON file in the `collections` directory to have your scraped content automatically reloaded in your DB even if you delete your db file.
}
```

<a name="cli"></a>
## The CLI

Drosse, once started, is a REPL console where you can type commands. It uses [Vorpal](https://github.com/dthree/vorpal).

This feature is still under active development, but you can already create your own commands and register them in the `.drosserc.js`.

### Built-in commands
`rs`: restarts the server

`db drop`: Resets the database to the initial state (json files) and restarts the server.

## Features
- Cascading Proxies
- Fallback to static JSON mocks
- In-memory db
- Endpoints scraping
- Seamless integration to your project OR
- Standalone global mode

## In progress
- CLI + UI
- Persist state (in-memory db dump to JSON file)

## Future features
- Anonymize data
- Journey
- Sync with OpenAPI (Swagger) ?
- GraphQL support ?
