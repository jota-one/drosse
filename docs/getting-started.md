# Getting started

## Installation

**As a local npm dependency in your node project**

1. Simply install it as a dev dependency of the project you want to mock.
```
npm install --save-dev @jota-one/drosse
```
2. Define a script in your `package.json` file for simpler usage
```json
{
      "name": "my-node-project",
      "scripts": {
        "mock-server": "npx drosse serve path/to/mocks-directory"
      },
      "devDependencies": {
        "@jota-one/drosse": "^1.0.0"
      }
}
```

**As a global npm package**
1. Install drosse globally.
```bash
npm i -g @jota-one/drosse
```

2. Run it via the `serve` command followed by the path of your drosse root folder:
```bash
drosse serve /path/to/my/mocks
```

## Usage
You need a directory where you will store all your mocks definitions.
1. Create a directory anywhere in your project repository (or anywhere else).
2. Update the `package.json` script you just added in the Installation phase to target your new mocks directory.
3. In your mocks directory, create a `routes.json` file. This file will hold every single mocked route of your server.
4. In the same directory, you can also create a `.drosserc.js` file. This file allows you to configure your mock server (see [Configuration](configuration.md)). It's optional but you will very likely need it.
