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

## Usage
You need a directory where you will store all your mocks definitions.
1. Create a directory anywhere in your project repository (or anywhere else).
2. Update the package.json script you just added in the Installation phase to target your new mocks directory.
3. In your mocks directory, create a `.drosserc.js` file. This file will allow you to define all the global configurations for your mock server.
4. In the same directory, create a `routes.json` file. This file will hold every single mocked route of your server.

> :grimacing: Yes there are a couple of things to do yourself. But you're a developer, right? You know how to edit a JSON file or a JS file. In the upcoming releases, we will add a CLI and a UI, don't worry!

Let's focuse a little bit on these 2 files. These are the only 2 mandatory files to run your mock server.

### The .drosserc.js file
This file is your mock server general configuration file. It must simply export a configuration object.

Here is a typical example of what it could contain.
```js
module.exports = {
  name: 'My mocks app',
  port: 8000
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
