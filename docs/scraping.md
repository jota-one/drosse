# Scraping

Do you remember, back in the days, these webscrapers ? You just turn them on then browse a website and they will eventually save the whole website on your machine? Well Drosse provides something similar, but a little less brutal as you can define precisely which endpoint you would like to scrape.

!> Endpoint scraping come along with the [Proxy](customize-response.md#proxy) feature. You won't scrape your own defined mocks, right?

You can scrape your proxied endpoints either _statically_ or _dynamically_.

## Static scraping
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

?> As usual, you can redefine this `scraped` directory name in your `.drosserc.js` file (see [Configuration](configuration.md)).

This can be a convenient way to populate your mocks contents if the backend API already exists. Just configure your mocks to proxy the existing API and activate the scraper. When you have enought contents, remove the proxy and redefine your mocked routes as `static` mocks.

Ideally you would rework your scraped contents and create relevant `static` file mocks out of it, maybe add some `templates`, etc. But you can also let them as they are, in the `scraped` directory: Drosse will always fallback on this directory if it doesn't find any match in the `static` directory.

## Dynamic scraping
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


?> As always, the scrapers directory can be renamed in the `.drosserc.js` file, with the `scraperServicesPath` property (see [Configuration](configuration.md)).

Your service must export a function which takes 2 parameters. The first one is the response of your scraped endpoint. It will be a JS object. The second one is the same `api` object as the one you get in a normal Drosse service.

This gives you then access to the `db` object, the whole drosse `config` object, the `req`, etc...

```js
module.exports = function (json, { db, config, req }) {
  // rework your json
  // save it in the database
  // create a proper JSON file in the `collections` directory to have your scraped content automatically reloaded in your DB even if you delete your db file.
}
```