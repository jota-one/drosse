# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
...

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

[Unreleased]: https://github.com/jota-one/drosse/compare/1.7.0...develop
[1.7.0]: https://github.com/jota-one/drosse/compare/1.6.0...1.7.0
[1.6.0]: https://github.com/jota-one/drosse/compare/1.5.0...1.6.0
[1.5.0]: https://github.com/jota-one/drosse/compare/1.4.1...1.5.0
[1.4.1]: https://github.com/jota-one/drosse/compare/1.4.0...1.4.1
[1.4.0]: https://github.com/jota-one/drosse/compare/1.3.0...1.4.0
[1.3.0]: https://github.com/jota-one/drosse/compare/1.2.0...1.3.0
[1.2.0]: https://github.com/jota-one/drosse/compare/1.1.0...1.2.0
[1.1.0]: https://github.com/jota-one/drosse/compare/1.0.0...1.1.0
[1.0.0]: https://github.com/jota-one/drosse/releases/tag/1.0.0
