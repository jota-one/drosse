# Routes
Routes are defined in a single `json` file.

## The routes.json file
This file is mandatory but you can customize its name in the `.drosserc.js` file (see [Configuration](configuration.md)). This is where you define all the routes you want to mock. Each route is defined as a tree, with _slash_ as separator.

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

## The DROSSE object
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

1. directly inside the `routes.json` file, using the `body` key (see [Inline mocks](inline-mocks.md)).
2. in a static JSON file with a constrained name (see [Static mocks](static-mocks.md))
3. in a dynamic JS file (we consider it a service) with a constrained name (see [Dynamic mocks](dynamic-mocks.md))

But before we move to the mock contents, let's have a look to the other stuffs you can put into the `DROSSE` object.