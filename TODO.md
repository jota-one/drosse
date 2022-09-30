# TODO

# Optional before/after 3.0 release
- [ ] test example websocket
- [ ] test feature static
- [ ] test feature assets
- [ ] test feature inheritance

# After 3.0 release
- [ ] allow to set middlewares in routes.json (at any level)
- [ ] support wildcards in static routes
- [ ] add some meta data, title and description to have nice preview when the website link is pasted somewhere (use Slack to proof that it works)
- [ ] refactor proxies: add option to chose fallback direction (proxy 1st then route | route 1st then proxy)
- [ ] run as module (using mjs and ES in drosserc and services)
      => "bin": { "drosse": "./dist/index.mjs" }
      => "bin": { "drosse-legacy": "./dist/index.cjs" }
      => "scripts": { "serve": "./dist/index.mjs" }
      => "scripts": { "serve:legacy": "./dist/index.cjs" }
      => ...
- [ ] make drosse usable in other codebase => "type": "module" in package.json
- [ ] Get rid of lodash
- [ ] Check that proxy inside proxy (sub-route) has priority
- [ ] Handle inherited configs in proxy (like throttle)
