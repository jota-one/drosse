<div align="center">
  <h1>
    <img src="https://raw.githubusercontent.com/jota-one/drosse/master/docs/_media/drosse-logo.svg"/>
    <br>
    Drosse
  </h1>
  <p><strong>Stateful & programmable mock server</strong></p>

[![NPM Vernion](https://flat.badgen.net/npm/v/@jota-one/drosse)](https://www.npmjs.com/package/@jota-one/drosse)
[![NPM Downloads](https://flat.badgen.net/npm/dt/@jota-one/drosse)](https://www.npmjs.com/package/@jota-one/drosse)
[![Package Size](https://flat.badgen.net/packagephobia/install/@jota-one/drosse)](https://packagephobia.now.sh/result?p=@jota-one/drosse)
[![Buy Me A Coffee][bmc-shield-src]][bmc-href]

<!-- Badges -->
[bmc-src]: https://bmc-cdn.nyc3.digitaloceanspaces.com/BMC-button-images/custom_images/orange_img.png
[bmc-href]: https://www.buymeacoffee.com/drosse
[bmc-shield-src]: https://img.shields.io/static/v1?message=Buy%20me%20a%20coffee&logo=buy-me-a-coffee&style=flat-square&label=Sponsor&logoColor=white&color=ff813f
</div>

**Drosse is a stateful and programmable mock server written in javascript.**

Based on [h3](https://github.com/unjs/h3), Drosse uses [loki](https://github.com/techfort/LokiJS)
to store your mock data in memory so you can modify them in your
`POST`, `PUT`, `PATCH` and `DELETE` requests.

It comes out of the box with all the features you need to completely simulate a backend API,
making it the best companion for any frontend developer 🤓

## Features

- ![](./docs/_media/paperclip.svg) **Tight to your project**: your mocks and your mock-server are part of your project. You can run as many drosse instances as you want simultaneously.

- ![](./docs/_media/configuration.svg) **Easy configuration**: configuring drosse is as simple as writing its port number in a `.drosserc.js` file and writing route definitions in a `routes.json` file.

- ![](./docs/_media/cascading.svg) **Cascading configs**: routes are defined as a JSON tree of sub-paths - plugins (throttle, proxy, ...) are inherited by child routes.

- ![](./docs/_media/static-mocks.svg) **Static mocks**: write mocks directly in the `routes.json` file (inline mode) or in JSON files (static mode).

- ![](./docs/_media/dynamic-mocks.svg) **Dynamic mocks**: build dynamic responses in javascript and access to the persisted data api, the request object and the NodeJS environment.

- ![](./docs/_media/assets.svg) **Assets handling**: serve multimedia files with patterns and wild cards for easy fallback.

- ![](./docs/_media/url-param.svg) **Dynamic URL params**: match any route/endpoint pattern with dynamic parameters => `/api/users/:id`.

- ![](./docs/_media/database.svg) **Data persistence**: work with stateful and interactive mocks thanks to the in-memory JSON database accessible via an easy-to-use API.

- ![](./docs/_media/throttle.svg) **Throttling**: delay response time of your routes, even the proxied ones.

- ![](./docs/_media/proxy.svg) **Proxying**: super-flexible proxy mechanism with inheritance and overwriting of sub-routes (with different proxy or local route).

- ![](./docs/_media/middleware.svg) **Middlewares**: extend Drosse with custom express middlewares to fulfill your use cases.

- ![](./docs/_media/template.svg) **Templates**: use response templates to avoid repeating yourself.

- ![](./docs/_media/scrape.svg) **Scraping**: scrape proxied endpoints and save the content to Drosse's database or static files.

- ![](./docs/_media/cli.svg) **Extensible REPL CLI**: build custom commands and execute them at runtime => simulate interaction with 3rp-party services.

## Examples
Find example code in the [examples](./examples) folder.

## Contact & Support

- Create a [GitHub issue](https://github.com/jota-one/drosse/issues) for bug reports, feature requests, or questions
- Add a ⭐️ [star on GitHub](https://github.com/jota-one/drosse) or ☕️ [buy us a coffe](https://www.buymeacoffee.com/drosse) to support the project!


## Development

- Clone this repository
- Install yarn globally using `npm install -g yarn`
- Install dependencies using `yarn`
- Build using `yarn build` or `yarn build:stub` for live rebuild
- Run drosse with `yarn serve examples/<example-folder-name>`


## Credits & License

**Drosse** is crafted by ([Jota](https://jota.one)) and licensed under the [MIT license](https://github.com/jota-one/drosse/blob/master/LICENSE).