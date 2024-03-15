<div align="center">
  <h1>
    <img src="https://raw.githubusercontent.com/jota-one/drosse/master/docs/_media/drosse-logo.svg"/>
    <br>
    Drosse
  </h1>
  <p><strong>Stateful & programmable mock server</strong></p>

[![NPM Version](https://flat.badgen.net/npm/v/@jota-one/drosse)](https://www.npmjs.com/package/@jota-one/drosse)
[![NPM Downloads](https://flat.badgen.net/npm/dt/@jota-one/drosse)](https://www.npmjs.com/package/@jota-one/drosse)
[![Package Size](https://flat.badgen.net/packagephobia/install/@jota-one/drosse)](https://packagephobia.now.sh/result?p=@jota-one/drosse)
[![Buy Me A Coffee][bmc-shield-src]][bmc-href]

<!-- Badges -->

[bmc-src]: https://bmc-cdn.nyc3.digitaloceanspaces.com/BMC-button-images/custom_images/orange_img.png
[bmc-href]: https://www.buymeacoffee.com/drosse
[bmc-shield-src]: https://img.shields.io/static/v1?message=Buy%20me%20a%20coffee&logo=buy-me-a-coffee&style=flat-square&label=Sponsor&logoColor=white&color=ff813f

</div>

**Drosse is a stateful and programmable mock server written in javascript.**

Based on [h3](https://h3.unjs.io/), Drosse uses [loki](https://github.com/techfort/LokiJS)
to store your mock data in memory so you can modify them in your
`POST`, `PUT`, `PATCH` and `DELETE` requests.

It comes out of the box with all the features you need to completely simulate a backend API,
making it the best companion for any frontend developer 🤓

## Features

![](./docs/assets/feature-icons/paperclip.svg) **Tight to your project**: your mocks and your mock-server are part of your project. You can run as many drosse instances as you want simultaneously.

![](./docs/assets/feature-icons/configuration.svg) **Easy configuration**: configuring drosse is as simple as writing its port number in a `.drosserc.js` file and writing route definitions in a `routes.json` file.

![](./docs/assets/feature-icons/cascading.svg) **Cascading configs**: routes are defined as a JSON tree of sub-paths - plugins (throttle, proxy, ...) are inherited by child routes.

![](./docs/assets/feature-icons/static-mocks.svg) **Static mocks**: write mocks directly in the `routes.json` file (inline mode) or in JSON files (static mode).

![](./docs/assets/feature-icons/dynamic-mocks.svg) **Dynamic mocks**: build dynamic responses in javascript and access to the persisted data api, the request object and the NodeJS environment.

![](./docs/assets/feature-icons/assets.svg) **Assets handling**: serve multimedia files with patterns and wild cards for easy fallback.

![](./docs/assets/feature-icons/url-param.svg) **Dynamic URL params**: match any route/endpoint pattern with dynamic parameters => `/api/users/:id`.

![](./docs/assets/feature-icons/database.svg) **Data persistence**: work with stateful and interactive mocks thanks to the in-memory JSON database accessible via an easy-to-use API.

![](./docs/assets/feature-icons/throttle.svg) **Throttling**: delay response time of your routes, even the proxied ones.

![](./docs/assets/feature-icons/proxy.svg) **Proxying**: super-flexible proxy mechanism with inheritance and overwriting of sub-routes (with different proxy or local route).

![](./docs/assets/feature-icons/middleware.svg) **Middlewares**: extend Drosse with custom express middlewares to fulfill your use cases.

![](./docs/assets/feature-icons/template.svg) **Templates**: use response templates to avoid repeating yourself.

![](./docs/assets/feature-icons/scrape.svg) **Scraping**: scrape proxied endpoints and save the content to Drosse's database or static files.

![](./docs/assets/feature-icons/cli.svg) **Extensible REPL CLI**: build custom commands and execute them at runtime => simulate interaction with 3rp-party services.

## Examples

Find example code in the [examples](./examples) folder.

## Contact & Support

- Create a [GitHub issue](https://github.com/jota-one/drosse/issues) for bug reports, feature requests, or questions
- Add a ⭐️ [star on GitHub](https://github.com/jota-one/drosse) or ☕️ [buy us a coffee](https://www.buymeacoffee.com/drosse) to support the project!

## Development

- Clone this repository
- Install yarn globally using `npm install -g yarn`
- Install dependencies using `yarn`
- Build using `yarn build` or `yarn build:stub` for live rebuild
- Run drosse with `yarn serve examples/<example-folder-name>`

### Running the documentation website locally with mkdocs

[Drosse's website](https://drosse.dev) is built with [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)
and uses the markdown form the [./docs](./docs/) folder as its content source.

Head up to the [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) website for detailed documentation about how to use it.

For running it locally, you need `python3` installed on your computer.

#### Install
```sh
# Create a virtual environment
python3 -m venv .venv

# Activate the virtual environment.
source .venv/bin/activate

# If `pip` is not installed => https://pip.pypa.io/en/stable/installation/

# Install python dependencies
pip install -r requirements.txt
```

#### Run
If not already done, activate the virtual environment:
```sh
source .venv/bin/activate
```

Run the documentation website with:
```sh
mkdocs serve
```

#### Publish a new version of the documentation
```sh
mike deploy --push --update-aliases <major>.<minor> latest
```

where `<major>.<minor>` is the current version you've written new documentation for.
`mike` is the versionning plugin used by mkdocs and has already been installed in the virtual environment.

**Note that** the `mike` command will generate the webiste in the (git-ignored) `site` folder and will
push it to the `gh-pages` branch remotely, so you don't need to checkout the `gh-pages` branch locally.

If you want/need to delete a version, use:
```sh
mike delete <major>.<minor> --push
```

If you want/need to delete everythin, use:
```sh
mike delete --all --push
```


More info in `mike` can be found here:
- [Material for MkDocs - Versioning](https://squidfunk.github.io/mkdocs-material/setup/setting-up-versioning/?h=version)
- [`mike`'s' official documentation](https://github.com/jimporter/mike)


## Credits & License

**Drosse** is crafted by [Jota](https://jota.one) and licensed under the [MIT license](https://github.com/jota-one/drosse/blob/master/LICENSE).
