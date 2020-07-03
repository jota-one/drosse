const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const useState = require('./use/useState')
const { checkRootFile, loadRcFile, routes } = require('./io')
const { parse, createProxies } = require('./parser')

const app = express()
const state = useState()


// global middlewares
app.use(bodyParser.json())

// start server
module.exports = args => {
  console.log(args)
  state.set('root', (args.root && path.resolve(args.root)) || path.resolve('.'))

  // check for some users configuration in a .drosserc(.js) file
  loadRcFile()

  // run some checks
  if (!checkRootFile()) {
    console.error(`Please create a "${state.get('routesFile')}.json" or a "${state.get('routesFile')}.js" file in this directory: ${state.get('root')}, and restart.`)
    process.exit()
  }

  // if everything is well configured, create the routes
  const routesDefinition = routes()
  parse(app, routesDefinition)
  createProxies(app)

  const port = args.port || state.get('port')
  app.listen(port, () => {
    console.log(`App started${state.get('name') && ': name -> ' + state.get('name')}`)
    console.log(`Listening to requests on http://localhost:${port}`)
    console.log(`The mocks will be read/written here: ${state.get('root')}`)
  })
}
