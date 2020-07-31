const fs = require('fs')
const http = require('http')
const express = require('express')
const sockjs = require('sockjs')
const getPort = require('get-port')
const Discover = require('node-discover')

const env = process.argv[2] || 'production'

const echo = sockjs.createServer({
  sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js'
})

echo.on('connection', conn => {
  const d = new Discover()

  d.on('added', data => {
    const adv = data.advertisement
    if (!adv) return
    conn.write(JSON.stringify({ event: 'up', adv }))
  })

  d.on('removed', data => {
    const adv = data.advertisement
    if (!adv) return
    conn.write(JSON.stringify({ event: 'down', adv }))
  })

  d.join('up', data => {
    conn.write(JSON.stringify({ event: 'up', adv: data }))
  })

  d.join('down', data => {
    conn.write(JSON.stringify({ event: 'down', adv: data }))
  })

  d.join('request', req => {
    conn.write(JSON.stringify({ event: 'request', req }))
  })
})

let app = {}

if (env === 'production') {
  app = express()
  app.use('/', express.static(__dirname))
}

getPort({ port: getPort.makeRange(8080, 9999), host: '0.0.0.0' }).then(port => {
  const server = http.createServer(app)

  if (env !== 'production') {
    fs.writeFileSync('.env.local', `VUE_APP_PORT=${port}`, 'utf8')
  }

  echo.installHandlers(server, { prefix:'/drosse' })
  server.listen(port)

  console.log(`Environment ${env}`)
  console.log(`Serving app on port ${port}`)
})