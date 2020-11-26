<img src="https://raw.githubusercontent.com/jota-one/drosse/master/Drosse.svg" style="width:350px;max-width:100%;margin: 25px 0;"/>

## What is it ?
> Drosse is the last mock server you'll ever need.

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
    "mock-server": "npx drosse-serve -r path/to/mocks-directory"
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

2. Run it via the `serve` command and your drosse folder as root via the `-r` param.
```
drosse serve -r /path/to/my/my/mocks
```

### As a Docker image
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
4. In the same directory, you can also create a `.drosserc.js` file. This file allows you to configure your mock server. It's optional but you will very likely need it.

Yes there are a couple of things to do yourself. But you're a developer, right? You know how to edit a JSON file or a JS file. In the upcoming releases, we will add a CLI and a UI, don't worry!

Let's focus first on these 2 files.

## The routes.json file
This file is mandatory but you can customize its name in the `.drosserc.js` file (see below). This is where you define all the routes you want to mock. Each route is defined as a tree, with _slash_ as separator.

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

_to be described..._

### Templates

_to be described..._

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

With such a definition, when you call `GET /api/users/65`, drosse will look for a specific JSON file in the `static` subdirectory of your mocks directory.

:fire: You can redefine this `static` directory name in your `.drosserc.js` file (see below).

Drosse will look for different filenames, from the more precise to the more generic until it finds one that matches. Let's keep the above example and see which filenames will be looked for:

```
api.users.65.get.json
api.users.65.json
api.users.:id.json
```

If you have a route with several path parameters, drosse will ignore them from left to right. Example, for this route:
```
GET /api/users/:id/posts/:type
```

Assuming that you have 2 types of posts, `unread` and `read` and a big quantity of users, it's more convenient to be able to define a mocked list of `read` posts and another mocked list of `unread` posts, independently of the user. For that usecase you can then create only 2 files in your `static` directory:

```
api.users.:id.posts.read.get.json
api.users.:id.posts.unread.get.json
```

:fire: If you are not sure of the precedence for a given route, just try and check the drosse console. It will log each failed attempts.

If we try to call `GET /api/users/3` and we have defined the following static mocks files in our `static` directory.

```
api.users.1.json
api.users.2.json
api.users:id.json
```

```bash
1:11:29 AM App Example JSON static app running at:
1:11:29 AM  - http://localhost:8000
1:11:29 AM  - http://172.22.22.178:8000

1:11:29 AM Mocks root: /some/path/mymocks

1:17:27 AM loadStatic: tried with [/some/path/mymocks/static/api.users.3.get.json]. File not found.
1:17:27 AM loadStatic: tried with [/some/path/mymocks/static/api.users.3.json]. File not found.
1:17:27 AM loadStatic: tried with [/some/path/mymocks/static/api.users.:id.get.json]. File not found.
```
You can see above that the system has first tried with the very precise `api.users.3.get.json` (resolved parameter + verb). Then it tries the same without verb (`api.users.3.json`). As it still fails, it tries without resolving the parameter, but again with the verb (`api.users.:id.get.json`) and finally find a corresponding mock file with `api.users.:id.json`. Of course this last one is not logged as it was found.

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

Now of course, there is no magic (yet!) here. You have now to create a file with the proper name and put it in the `services` subdirectory of your mocks directory.

:fire: Like for the others subdirectories, you can redefine this `services` directory name in your `.drosserc.js` file (see below).

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

As you can see, the object argument gives you access to the well known `req` and `res` objects from Express. With those two you and the full power of javascript, you can already do more than what you will ever need in a mock-server.

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

_To be described... (check the code)._

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
| `name`               | **(empty)**     | The name of your app. Mostly used to recognize it in your console or in [drosse UI](https://github.com/jota-one/drosse-ui). |
| `port`               | **8000**        | The port on which your mock server will run.<br>If not specified in `.drosserc.js` and already in use, Drosse will use the next available port if finds (8001, 8002, etc.) |
| `routesFile`         | **routes**      | Name of the routes definition file. |
| `collectionsPath`    | **collections** | Relative path to the loki collections directory from your mocks directory. |
| `shallowCollections` | **[]**          | List of collections that should be recreated/overriden on each server restart. |
| `servicesPath`       | **services**    | Relative path to the services directory from your mocks directory. |
| `staticPath`         | **static**      | Relative path to the static files directory from your mocks directory. |
| `database`           | **mocks.db**    | Name of your loki database dump file. |

## Features
- Cascading Proxies
- Fallback to static JSON mocks
- In-memory db
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
