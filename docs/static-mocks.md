# Static mocks

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
            "static": true,
            "extensions": ["json"]
          }
        }
      }
    }
  }
}
```

With such a definition, when you call `GET /api/users/65?withDetails=1`, drosse will look for a specific file in the `static` subdirectory of your mocks directory.

?> You can redefine this `static` directory name in your `.drosserc.js` file (see [Configuration](configuration.md)).

Drosse will look for different filenames, from the more precise to the more generic until it finds one that matches. Let's keep the above example and see which filenames will be looked for:

```
api.users.65.get&&withDetails=1.json
api.users.65.get.json
api.users.65.json
api.users.{id}.json
```

You can pass more than one extension to check for. By default, if you don't pass the `extensions` key next to the `static` key, it will fallback to `["json"]`. If you search
for other file types, like images for example, Drosse will automatically return the file instead of a JSON response.

If you have a route with several path parameters, drosse will ignore them from left to right. Example, for this route:
```
GET /api/users/:id/posts/:type
```

Assuming that you have 2 types of posts, `unread` and `read` and a big quantity of users, it's more convenient to be able to define a mocked list of `read` posts and another mocked list of `unread` posts, independently of the user. For that usecase you can then create only 2 files in your `static` directory:

```
api.users.{id}.posts.read.get.json
api.users.{id}.posts.unread.get.json
```

?> If you are not sure of the precedence for a given route, just try and check the drosse console. It will log each failed attempts.

If we try to call `GET /api/users/3` and we have defined the following static mocks files in our `static` directory.

```
api.users.1.json
api.users.2.json
api.users.{id}.json
```

```shell
1:11:29 AM App Example JSON static app running at:
1:11:29 AM  - http://localhost:8000
1:11:29 AM  - http://172.22.22.178:8000

1:11:29 AM Mocks root: /some/path/mymocks

1:17:27 AM loadStatic: tried with [/some/path/mymocks/static/api.users.3.get.json]. File not found.
1:17:27 AM loadStatic: tried with [/some/path/mymocks/static/api.users.3.json]. File not found.
1:17:27 AM loadStatic: tried with [/some/path/mymocks/static/api.users.{id}.get.json]. File not found.
```
You can see above that the system has first tried with the most precise `api.users.3.get.json` (resolved parameter + verb). Then it tries the same without verb (`api.users.3.json`). As it still fails, it tries without resolving the parameter, but again with the verb (`api.users.{id}.get.json`) and finally find a corresponding mock file with `api.users.{id}.json`. Of course this last one is not logged as it was found.

?> if Drosse really doesn't find any file corresponding to the requested endpoint, it will give an ultimate look in the `scraped` static files. More on this in the [Scraping](scraping.md) section.