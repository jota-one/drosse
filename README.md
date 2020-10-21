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
2. Update the package.json script you just added in the Installation phase to target your new mocks directory.
3. In your mocks directory, create a `routes.json` file. This file will hold every single mocked route of your server.
4. In the same directory, you can also create a `.drosserc.js` file. This file will allow you to define all the global configurations for your mock server. It's optional but you will very likely need it.

> :grimacing: Yes there are a couple of things to do yourself. But you're a developer, right? You know how to edit a JSON file or a JS file. In the upcoming releases, we will add a CLI and a UI, don't worry!

Let's focus first on these 2 files.

### The routes.json file
This file is mandatory and has to be a JSON file. You can however define its name in the `.drosserc.js` file (see below). In this file you will define each route you want to mock. Each route will be defined as a tree, with the _slash_ as separators.

> :dizzy_face: Woot ? Tree ? Slash ? I just want to mock a couple of routes...

Ooook, an example worth a thousand sentences of bad explanation. Let's say you want to mock these 2 routes:

```
GET /api/users
GET /api/users/:id
```

You will create a _tree_ in your `routes.json` file like this:

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
That's where the `DROSSE` object arrives and saves our souls. Look at this:

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

There we go! You can mock your datas with 3 different ways:
1. directly inside the `routes.json` file, using the `body` key (inlined mocks).
2. in a static JSON file with a constrainted name
3. in a dynamic JS service with a constrained name

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


### The .drosserc.js file
This file is your mock server general configuration file. It's optional as all its keys have default values. It must simply export a configuration object.

Here is a typical example of what it could contain.
```js
module.exports = {
  name: 'My mocks app',
  port: 8000
}
```

#### All configuration keys
|Key               |Default value|Description|
|------------------|-------------|-----------|
|name              |_(empty)_    |The name of your app. Mostly used to recognize it in your console or in [drosse UI](https://github.com/jota-one/drosse-ui).|
|port              |_8000_       |The port on which your mock server will run.|
|routesFile        |_routes_     |Name of the routes definition file.|
|collectionsPath.  |_collections_|Relative path to the loki collections directory from your mocks directory.|
|shallowCollections|_[]_         |List of collections that should be recreated/overriden on each server restart.|
|servicesPath      |_services_   |Relative path to the services directory from your mocks directory.|
|staticPath        |_static_     |Relative path to the static files directory from your mocks directory.|
|database          |_mocks.db_   |Name of your loki database dump file.|

## Features
- Cascading Proxies
- Fallback to static JSON mocks
- In-memory db
- Seamless integration to your project OR
- Standalone global mode

## In progress
- CLI + UI
- Persist state (in-memory db dump to JSON file)
- Anonymize data

## Future features
- Hateoas support
- Journey
- Sync with OpenAPI (Swagger) ?
- GraphQL support ?

## Notes
- [on using require inside nodejs modules for testing](https://stackoverflow.com/questions/5747035/how-to-unit-test-a-node-js-module-that-requires-other-modules-and-how-to-mock-th) with [proxyquire](https://www.npmjs.com/package/proxyquire):

## Warning
This project is in an early stage and under active development. API might change without notice.
