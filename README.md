<img src="./Drosse.svg"/>

## What is it ?
> Drosse is the last mock server you'll ever need.

## Installation
via [npm](https://www.npmjs.com/package/@jota-one/drosse)

1. Simply install it as a dev dependency of the project you want to mock.
```
npm install --save-dev @jota-one/drosse
```
2. Define a script in your `package.json` file for simpler usage
```json
{
  "name": "my-node-project",
  "scripts": {
    "mock-server": "npx drosse serve -r path/to/mocks-directory"
  },
  "devDependencies": {
    "@jota-one/drosse": "^1.0.0"
  }
}
```

## Features
- Cascading Proxies
- Fallback to static JSON mocks
- In-memory db
- Seamless integration to your project OR
- Standalone global mode

## In progress
- CLI + UI
- Persist state (in-memory db dump to JSON file)
- Anonymize data

## Future features
- Hateoas support
- Journey
- Sync with OpenAPI (Swagger) ?
- GraphQL support ?

## Notes
- [on using require inside nodejs modules for testing](https://stackoverflow.com/questions/5747035/how-to-unit-test-a-node-js-module-that-requires-other-modules-and-how-to-mock-th) with [proxyquire](https://www.npmjs.com/package/proxyquire):

## Warning
This project is in an early stage and under active development. API might change without notice.
