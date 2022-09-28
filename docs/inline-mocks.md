# Inline mocks

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