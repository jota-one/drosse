const fs = require('fs')

fs.copyFileSync(
  './node_modules/sockjs-client/dist/sockjs.min.js',
  './public/sockjs.min.js'
)

fs.copyFileSync(
  './node_modules/sockjs-client/dist/sockjs.min.js.map',
  './public/sockjs.min.js.map'
)
