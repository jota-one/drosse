# Configuration

## The .drosserc.js file

This file holds your mock server general configuration. It's optional as all its keys have default values. It must simply export a configuration object.

Here is a typical example of what it could contain.

```js
import { defineDrosseServer } from '@jota-one/drosse'

export default defineDrosseServer({
  name: 'My mocks app',
  port: 8000,
})
```

## Configuration reference

| Key                   | Default value   | Description                                                                                                                                                                                                                                                                                  |
| --------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                | -               | The name of your app. Mostly used to recognize it in your console or in [drosse UI](https://github.com/jota-one/drosse-ui).                                                                                                                                                                  |
| `port`                | `8000`          | The port on which your mock server will run.<br>If not specified in `.drosserc.js` and already in use, Drosse will use the next available port if finds (8001, 8002, etc.)                                                                                                                   |
| `baseUrl`             | -               | The base URL (ex. http://my.domain.com) for the routes                                                                                                                                                                                                                                       |
| `basePath`            | -               | A prefix (ex. /api/v2) that will be added to each route path                                                                                                                                                                                                                                 |
| `routesFile`          | `routes`        | Name of the routes definition file.                                                                                                                                                                                                                                                          |
| `collectionsPath`     | `collections`   | Relative path to the loki collections directory from your mocks directory.                                                                                                                                                                                                                   |
| `shallowCollections`  | `[]`            | List of collections that should be recreated/overriden on each server restart.                                                                                                                                                                                                               |
| `assetsPath`          | `assets`        | Relative path to the assets directory from your mocks directory.                                                                                                                                                                                                                             |
| `servicesPath`        | `services`      | Relative path to the services directory from your mocks directory.                                                                                                                                                                                                                           |
| `staticPath`          | `static`        | Relative path to the static files directory from your mocks directory.                                                                                                                                                                                                                       |
| `scraperServicesPath` | `scrapers`      | Relative path to the scraper services files directory from your mocks directory.                                                                                                                                                                                                             |
| `scrapedPath`         | `scraped`       | Relative path to the scraped files directory from your mocks directory.                                                                                                                                                                                                                      |
| `database`            | `mocks.db`      | Name of your loki database dump file.                                                                                                                                                                                                                                                        |
| `dbAdapter`           | `LokiFsAdapter` | IO adapter to use for database persistence.                                                                                                                                                                                                                                                  |
| `middlewares`         | `['morgan']`    | List of global middlewares. Drosse provides 2 built-in middlewares, 1 being added by default. The second one is 'open-cors'.                                                                                                                                                                 |
| `templates`           | `{}`            | Templates to be used in `routes.json`. See [Templates](customize-response.md#templates) documentation.                                                                                                                                                                                       |
| `extendServer`        | -               | Used to set custom instructions to the server application. Must be a function with the following signature: `function ({ server, app, db }) {}`. `server` being the node http.Server instance, `app` the [h3](https://github.com/unjs/h3) instance and `db` the [drosse db api](db-api#api). |
| `onHttpUpgrade`       | `null`          | A function that initiates a websocket connection. This is happening once during HTTP protocol upgrade handshake. Must be a function with the following signature: `function (request, socket, head) { ... }`.                                                                                |
| `commands`            | -               | Used to extend Drosse CLI with custom commands. Must be a function with the following signature: function (vorpal, drosse) { ... }. See the [CLI commands](commands.md) documentation.                                                                                                       |
