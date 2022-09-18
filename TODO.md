# TODO

- [x] test example database @Tadai
- [x] test import() with ES module at runtime @Tadai
- [x] implement configureExpress (as configureServer) and onHttpUpgrade @Tadai
- [x] implement repl/vorpal mode @Tadai
- [x] handle options (--no-repl --proxy) @Tadai
- [x] implement runCommand @Tadai
- [x] implement 'static' command @Tadai
- [x] implement proxy fallback for 'static' command @Tadai
- [x] add bin in package.json => "bin": { "drosse": "./dist/index.cjs" } @Tadai
- [x] implement discover @Tadai

- [ ] Fix and test /api/countries-slow (proxy + throttle) not working in examples/configured @Tadai
- [ ] refactor proxies: add option to chose fallback direction (proxy 1st then route | route 1st then proxy) @Tadai
- [ ] refactor (more generic) hateoas-links json-response rewrite mw @Tadai
- [ ] fix/review mw length 4 => curry @Tadai
- [ ] Create clean PR with git history @Tadai
- [ ] add .autorc @Tadai
- [ ] build static website drosse.dev with docsify @Tadai
- [ ] run as module (using mjs and ES in drosserc and services) @Tadai
      => "bin": { "drosse": "./dist/index.mjs" }
      => "bin": { "drosse-legacy": "./dist/index.cjs" }
      => "scripts": { "serve": "./dist/index.mjs" }
      => "scripts": { "serve:legacy": "./dist/index.cjs" }
      => ...
- [ ] make drosse usable in other codebase => "type": "module" in package.json @Tadai

- [ ] test example websocket @Tadai
- [ ] test feature templates @Tadai
- [ ] test feature proxies @Tadai
- [ ] test feature static @Tadai
- [ ] test feature assets @Tadai
- [ ] test feature inheritance @Tadai