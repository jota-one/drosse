# Assets

You can use the `assets` property in the `DROSSE` object to tell a path to serve only static contents. Let's check the following example:

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

?> You can redefine this `assets` directory name in your `.drosserc.js` file (see [Configuration](configuration.md)).