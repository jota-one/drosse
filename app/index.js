const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const Discover = require('node-discover')
const useState = require('./use/useState')
const useDb = require('./use/useDb')
const { checkRootFile, loadRcFile, routes } = require('./io')
const { parse, createProxies } = require('./parser')

const app = express()
const state = useState()
const db = useDb()

// global middlewares
app.use(bodyParser.json())
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')

  // intercept OPTIONS method
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

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

  // add reserved UI route
  app.get('/UI', (req, res) => {
    res.send({
      routes: routes()
    })
  })

  const proto = 'http'
  const host = 'localhost'
  const port = args.port || state.get('port')
  const name = state.get('name')
  const root = path.dirname(__dirname)

  app.listen(port, () => {
    console.log(`App started${name && ': name -> ' + name}`)
    console.log(`Listening to requests on ${proto}://${host}:${port}`)
    console.log(`The mocks will be read/written here: ${state.get('root')}`)
  })

  const d = new Discover()

  d.advertise({ name, proto, host, port, root })
}
