<img src="./Drosse.svg"/>

## What is it ?
> Drosse is the last mock server you'll ever need.

## Installation
via [npm](https://www.npmjs.com/package/@jota-one/drosse)

1. Simply install it as a dev dependency of the project you want to mock.
```
npm install --save-dev @jota-one/drosse
```
2. Define a script in your `package.json` file for simpler usage
```json
{
  "name": "my-node-project",
  "scripts": {
    "mock-server": "npx drosse serve -r path/to/mocks-directory"
  },
  "devDependencies": {
    "@jota-one/drosse": "^1.0.0"
  }
}
```

## Usage
You need a directory where you will store all your mocks definitions.
1. Create a directory anywhere in your project repository (or anywhere else).
2. Update the `package.json` script you just added in the Installation phase to target your new mocks directory.
3. In your mocks directory, create a `routes.json` file. This file will hold every single mocked route of your server.
4. In the same directory, you can also create a `.drosserc.js` file. This file allows you to configure your mock server. It's optional but you will very likely need it.

Yes there are a couple of things to do yourself. But you're a developer, right? You know how to edit a JSON file or a JS file. In the upcoming releases, we will add a CLI and a UI, don't worry!

Let's focus first on these 2 files.

### The routes.json file
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

#### The DROSSE object
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
1. directly inside the `routes.json` file, using the `body` key (inlined mocks).
2. in a static JSON file with a constrained name
3. in a dynamic JS file (we consider it a service) with a constrained name

#### Inline mocks

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

#### Static mocks (in separated files)

As you've probably noticed, the inline mocks are not that dynamic... For instance, if we take the `GET /api/users/:id` route, you can call it with any value for `:id`, you will always get the same response. Although it can be enough for most usecases, sometimes we want a little bit more.


### The .drosserc.js file
This file holds your mock server general configuration. It's optional as all its keys have default values. It must simply export a configuration object.

Here is a typical example of what it could contain.
```js
module.exports = {
  name: 'My mocks app',
  port: 8000
}
```

#### All configuration keys
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

## Warning
This project is in an early stage and under active development. API might change without notice.
