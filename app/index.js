const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const { setScope, checkRootFile, getScope, routes } = require('./io')
const { parse } = require('./parser')

const app = express()


// global middlewares
app.use(bodyParser.json())

// start server
module.exports = args => {
  console.log(args)
  const port = args.port || process.env.PORT || '8000'
  setScope('root', path.resolve(args.root) || path.resolve('.'))
  if (args.routesFile) {
    setScope('routesFile', args.routesFile)
  }

  // run some checks
  if (!checkRootFile()) {
    console.error(`Please create a "${getScope('routesFile')}.json" or a "${getScope('routesFile')}.js" file in this directory: ${getScope('root')}, and restart.`)
    process.exit()
  }

  // if everything is well configured, create the routes
  const routesDefinition = routes()
  parse(app, routesDefinition)

  app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`)
    console.log(`The mocks will be read/written here: ${getScope('root')}`)
  })
}
