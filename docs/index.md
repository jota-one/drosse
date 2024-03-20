<div id="drosse-hero">
  <h1>
    <img src="assets/drosse-logo.svg" height="100px" width="100px"/>
    <img src="assets/drosse-title.svg" height="180px" width="180px"/>
  </h1>
  <p>
    Stateful & programmable<br>mock server
  </p>
</div>

# Introduction

[![NPM Version](https://flat.badgen.net/npm/v/@jota-one/drosse)](https://www.npmjs.com/package/@jota-one/drosse)
[![NPM Downloads](https://flat.badgen.net/npm/dt/@jota-one/drosse)](https://www.npmjs.com/package/@jota-one/drosse)
[![Package Size](https://flat.badgen.net/packagephobia/install/@jota-one/drosse)](https://packagephobia.now.sh/result?p=@jota-one/drosse)
[![Buy Me A Coffee][bmc-shield-src]][bmc-href]

<!-- Badges -->

[bmc-src]: https://bmc-cdn.nyc3.digitaloceanspaces.com/BMC-button-images/custom_images/orange_img.png
[bmc-href]: https://www.buymeacoffee.com/drosse
[bmc-shield-src]: https://img.shields.io/static/v1?message=Buy%20me%20a%20coffee&logo=buy-me-a-coffee&style=flat-square&label=Sponsor&logoColor=white&color=ff813f

**Drosse is a stateful and programmable mock server written in javascript.**

Based on [h3](https://h3.unjs.io/), Drosse uses [loki](https://github.com/techfort/LokiJS)
to store your mock data in memory so you can modify them in your
`POST`, `PUT`, `PATCH` and `DELETE` requests.

It comes out of the box with all the features you need to completely simulate a backend API,
making it the best companion for any frontend developer 🤓

## Features

<div class="grid cards" markdown>

- ![](assets/feature-icons/paperclip.svg) **Tight to your project**
<br>
<small>
Your mocks and your mock-server are part of your project.
You can run as many drosse instances as you want simultaneously.
</small>

- ![](assets/feature-icons/configuration.svg) **Easy configuration**
<br>
<small>
Configuring drosse is as simple as writing its port number in a `.drosserc.js`
file and writing route definitions in a `routes.json` file.
</small>

- ![](assets/feature-icons/cascading.svg) **Cascading configs**
<br>
<small>
Routes are defined as a JSON tree of sub-paths - plugins (throttle, proxy, ...)
are inherited by child routes.
</small>

- ![](assets/feature-icons/static-mocks.svg) **Static mocks**
<br>
<small>
Write mocks directly in the `routes.json` file (inline mode) or in JSON files
(static mode).
</small>

- ![](assets/feature-icons/dynamic-mocks.svg) **Dynamic mocks**
<br>
<small>
Build dynamic responses in javascript and access to the persisted data api,
request and response objects and the NodeJS environment.
</small>

- ![](assets/feature-icons/assets.svg) **Assets handling**
<br>
<small>
Serve multimedia files with patterns and wild cards for easy fallback.
</small>

- ![](assets/feature-icons/url-param.svg) **Dynamic URL params**
<br>
<small>
Match any route/endpoint pattern with dynamic parameters (e.g. `/api/users/:id`).
</small>

- ![](assets/feature-icons/database.svg) **Data persistence**
<br>
<small>
Work with stateful and interactive mocks thanks to the in-memory JSON database
accessible via an easy-to-use API.
</small>

- ![](assets/feature-icons/throttle.svg) **Throttling**
<br>
<small>
Delay response time of your routes, even the proxied ones.
</small>

- ![](assets/feature-icons/proxy.svg) **Proxying**
<br>
<small>
Super-flexible proxy mechanism with inheritance and overwriting of sub-routes
(with different proxy or local route).
</small>

- ![](assets/feature-icons/middleware.svg) **Middlewares**
<br>
<small>
Extend Drosse with custom express middlewares to fulfill your use cases
(user session, websocket, jwt, ...).
</small>

- ![](assets/feature-icons/template.svg) **Templates**
<br>
<small>
Uuse response templates to avoid repeating yourself.
</small>

- ![](assets/feature-icons/scrape.svg) **Scraping**
<br>
<small>
Scrape proxied endpoints and save the content to Drosse's database or
static files.
</small>

- ![](assets/feature-icons/cli.svg) **Extensible REPL CLI**
<br>
<small>
Build custom commands and execute them at runtime => simulate interaction
with 3rp-party services.
</small>

</div>

## Examples

Find example code in the [examples](https://github.com/jota-one/drosse/tree/master/examples) folder.

## Contact & Support

- Create a [GitHub issue](https://github.com/jota-one/drosse/issues) for bug reports, feature requests, or questions
- Add a ⭐️ [star on GitHub](https://github.com/jota-one/drosse) or ☕️ [buy us a coffe](https://www.buymeacoffee.com/drosse) to support the project!

<a href="https://www.buymeacoffee.com/drosse" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="margin-top:10px;height:40px" ></a>

## Credits & License

**Drosse** is crafted by [Jota](https://jota.one) and licensed under the [MIT license](https://github.com/jota-one/drosse/blob/master/LICENSE).
