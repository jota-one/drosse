const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const useState = require('./use/useState')
const useDb = require('./use/useDb')
const { checkRootFile, loadRcFile, routes } = require('./io')
const { parse, createProxies } = require('./parser')

const app = express()
const state = useState()
const db = useDb()

// global middlewares
app.use(bodyParser.json())

// start server
module.exports = async args => {
  state.set('root', (args.root && path.resolve(args.root)) || path.resolve('.'))

  // check for some users configuration in a .drosserc(.js) file
  loadRcFile()

  // run some checks
  if (!checkRootFile()) {
    console.error(`Please create a "${state.get('routesFile')}.json" or a "${state.get('routesFile')}.js" file in this directory: ${state.get('root')}, and restart.`)
    process.exit()
  }

  // if everything is well configured, load database and create the routes
  await db.loadDb()
  parse(app, routes())
  createProxies(app)

  const port = args.port || state.get('port')
  app.listen(port, '0.0.0.0', () => {
    console.log(`App started${state.get('name') && ': name -> ' + state.get('name')}`)
    console.log(`Listening to requests on http://0.0.0.0:${port}`)
    console.log(`The mocks will be read/written here: ${state.get('root')}`)
  })
}
