const http = require('http')
const sockjs = require('sockjs')
const Discover = require('node-discover')

const echo = sockjs.createServer({
  sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js'
})

echo.on('connection', conn => {
  const d = new Discover()

  d.on("added", function (obj) {
    const adv = obj.advertisement
    if (!adv) return
    conn.write(JSON.stringify({ event: 'up', adv }))
  })

  d.on("removed", function (obj) {
    const adv = obj.advertisement
    if (!adv) return
    conn.write(JSON.stringify({ event: 'down', adv }))
  })

  conn.on('data', message => {
    conn.write(message)
  })

  conn.on('close', () => {
    console.log('closed...')
  })

})

const server = http.createServer()

echo.installHandlers(server, { prefix:'/drosse' })
server.listen(9999)