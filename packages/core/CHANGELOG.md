# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

# [Unreleased]

## [2.3.1] - 2021-08-31
### Fixed
- Fix an issue when running the `exit` command in CLI. A node sub-process was staying alive when it should have been killed.
- Fix an issue when running the `rs` command in CLI. The server was restarted with CLI context lost.

## [2.3.0] - 2021-08-30
### Added
- Added log message if the .drosserc.js file isn't loaded for some reason.
- Added new 'rs' command in CLI to restart the server

### Changed
- Simplified startup script. If no `-r` or `--root` param is provided, the first term passed after the command name will be taken as root directory.

## [2.2.0] - 2021-05-25
### Fixed
- custom errorHandler was not loaded
- dependencies issues

## [2.1.0] - 2021-04-17
### Added
- Added a 'restart' function in the CLI context
- Added drosse version on startup
- Added a `dbAdapter` config property to allow database persistence adapter change. Supports custom adapters.

### Fixed
- Error handling in services

## [2.0.0] - 2021-03-22
### Changed
- Drosse runs now at 2 different layers. When it's started, it will start the express app in a child process and keep the CLI on the parent process. This will be helpful to offer a better control on the express app from external tools, like e2e testing frameworks or the upcoming Drosse-UI. And this separates as well the CLI (vorpal) layer, which needs to stay an Interface and not be mixed with business logic, from the pure app commands layer.

## [1.13.2] - 2021-03-10
### Added
- added a `basePath` config

## [1.13.1] - 2021-03-09
### Added
- added a `baseUrl` config

## [1.13.0] - 2021-03-05
### Added
- auto scraping mode, no service needed
- fallback from static files to scraped files

### Changed
- renamed 'hoover' feature to 'scraper'

## [1.12.0] - 2021-02-26
### Added
- new route option 'hoover' to use along with 'proxy'. Allow to save proxied route response body as a drosse mock content.

### Changed
- Pass drosse config (state) and db to the vorpal CLI. Which allows to make db queries in CLI commands.

## [1.11.3] - 2021-02-25
### Added
- Added new `configureExpress` property in `.drosserc.js` to define custom configurations on the `express` app instance.

## [1.11.2] - 2021-02-24
### Changed
- App middlewares can now take a fourth argument (at the first place) and will then be curried and having the drosse API injected into the middleware function

## [1.11.1] - 2021-02-18
### Added
- Support for async services

## [1.11.0] - 2021-02-12
### Added
- Allow throttle for proxied routes
- Allow to define throttle only with min or max

## [1.10.0] - 2021-01-20
### Changed
- Changed the proxy configuration to make it actually usable intuitively. From now, the URL path to where the proxy is defined is removed from the proxied path.

### Added
- Added `db drop` command in the REPL CLI.
- Added documentation and examples for the proxy feature.
- Added documentation for the assets feature.
- Added documentation for the template feature.
- Added documentation for the DB api.

### Fixed
- Fix db.get.byRef to not overwrite custom content with generic content

## [1.9.0] - 2021-01-13
### Changed
- Changed the Drosse repository to a monorepo. Now it holds as well drosse UI and drosse website.

## [1.8.0] - 2021-01-05
### Added
- Added a REPL CLI with an extensible command system.

### Fixed
- Avoid errors in case of silent:false configuration in the child-process

## [1.7.0] - 2020-12-30
### Added
- Added a `config` property (aka state.get()) in the exposed API.

## [1.6.0] - 2020-12-24
### Added
- Added `responseType` DROSSE config with "file" as possible value.
- Added possibility to _cancel_ an inherited template by passing `"template": null` in the DROSSE config object.
- Added support for loki `where()` method in both `db.get` and `db.list` namespaces from db API.

## [1.5.0] - 2020-12-18
### Added
- Support for static assets through the `assets` keyword in `DROSSE` object.

## [1.4.1] - 2020-12-01
### Fixed
- Fix routes creation order

## [1.4.0] - 2020-12-01
### Added
- Add `drosse-serve` bin entry in package.json
- A collection can be defined as a unique JSON file containing an array of objects.

### Changed
- Skip reserved routes in logging module
- Improved logging on startup

### Removed
- Remove old logging module


## [1.3.0] - 2020-11-19
TODO

## [1.2.0] - 2020-11-17
TODO

## [1.1.0] - 2020-11-10
TODO

## [1.0.0] - 2020-10-28
TODO

[Unreleased]: https://github.com/jota-one/drosse/compare/2.3.1...develop
[2.3.1]: https://github.com/jota-one/drosse/compare/2.3.0...2.3.1
[2.3.0]: https://github.com/jota-one/drosse/compare/2.2.0...2.3.0
[2.2.0]: https://github.com/jota-one/drosse/compare/2.1.0...2.2.0
[2.1.0]: https://github.com/jota-one/drosse/compare/2.0.0...2.1.0
[2.0.0]: https://github.com/jota-one/drosse/compare/1.13.2...2.0.0
[1.13.2]: https://github.com/jota-one/drosse/compare/1.13.1...1.13.2
[1.13.1]: https://github.com/jota-one/drosse/compare/1.13.0...1.13.1
[1.13.0]: https://github.com/jota-one/drosse/compare/1.12.0...1.13.0
[1.12.0]: https://github.com/jota-one/drosse/compare/1.11.3...1.12.0
[1.11.3]: https://github.com/jota-one/drosse/compare/1.11.2...1.11.3
[1.11.2]: https://github.com/jota-one/drosse/compare/1.11.1...1.11.2
[1.11.1]: https://github.com/jota-one/drosse/compare/1.11.0...1.11.1
[1.11.0]: https://github.com/jota-one/drosse/compare/1.10.0...1.11.0
[1.10.0]: https://github.com/jota-one/drosse/compare/1.9.0...1.10.0
[1.9.0]: https://github.com/jota-one/drosse/compare/1.8.0...1.9.0
[1.8.0]: https://github.com/jota-one/drosse/compare/1.7.0...1.8.0
[1.7.0]: https://github.com/jota-one/drosse/compare/1.6.0...1.7.0
[1.6.0]: https://github.com/jota-one/drosse/compare/1.5.0...1.6.0
[1.5.0]: https://github.com/jota-one/drosse/compare/1.4.1...1.5.0
[1.4.1]: https://github.com/jota-one/drosse/compare/1.4.0...1.4.1
[1.4.0]: https://github.com/jota-one/drosse/compare/1.3.0...1.4.0
[1.3.0]: https://github.com/jota-one/drosse/compare/1.2.0...1.3.0
[1.2.0]: https://github.com/jota-one/drosse/compare/1.1.0...1.2.0
[1.1.0]: https://github.com/jota-one/drosse/compare/1.0.0...1.1.0
[1.0.0]: https://github.com/jota-one/drosse/releases/tag/1.0.0
