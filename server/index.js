const fs = require('fs')
const os = require('os')
const path = require('path')
const http = require('http')
const ip = require('ip')
const express = require('express')
const bodyParser = require('body-parser')
const sockjs = require('sockjs')
const getPort = require('get-port')
const Discover = require('node-discover')

const getDrosses = () => {
  const drosses = JSON.parse(fs.readFileSync(drossesFile, 'utf8'))
  const uuids = Object.keys(drosses)

  for (const uuid of uuids) {
    drosses[uuid].available = fs.existsSync(drosses[uuid].root)
    drosses[uuid].up = false
  }

  updateDrosses(drosses)
  return drosses
}

const updateDrosses = (_drosses) => {
  fs.writeFileSync(drossesFile, JSON.stringify(_drosses || drosses, null, 2), 'utf8')
}

const up = (d, conn) => {
  drosses[d.uuid] = { ...drosses[d.uuid], ...d }

  const drosse = drosses[d.uuid]

  drosse.up = true
  drosse.lastSeen = drosse.lastSeen || new Date()
  drosses[drosse.uuid].available = fs.existsSync(drosses[drosse.uuid].root)

  updateDrosses()
  conn.write(JSON.stringify({ event: 'up', drosse }))
}

const down = (d, conn) => {
  const drosse = drosses[d.uuid]

  if (drosse) {
    drosse.up = false
    drosse.lastSeen = new Date()
  }

  updateDrosses()
  conn.write(JSON.stringify({ event: 'down', drosse }))
}

const env = process.argv[2] || 'production'
const home = path.join(os.homedir(), '.drosse-ui')
const drossesFile = path.join(home, 'drosses.json')
const app = express()
let d

app.use(bodyParser.json())

if (!fs.existsSync(home)) {
  fs.mkdirSync(home)
}

if (!fs.existsSync(drossesFile)) {
  fs.writeFileSync(drossesFile, '{}', 'utf8')
}

let drosses = getDrosses()
const echo = sockjs.createServer({ sockjs_url: '/sockjs.min.js' })

echo.on('connection', conn => {
  d = new Discover({ advertisement: {} })

  d.on('added', data => {
    const adv = data.advertisement
    if (!adv) return
    if (!adv.isDrosse) return

    const drosse = drosses[adv.uuid]
    if (!drosse || (drosse && !drosse.up)) {
      up(adv, conn)
    }
  })

  d.join('up', drosse => { up(drosse, conn) })
  d.join('down', drosse => { down(drosse, conn) })
  d.join('log', ({ uuid, msg }) => {
    conn.write(JSON.stringify({ event: 'log', uuid, msg }))
  })
  d.join('request', request => {
    conn.write(JSON.stringify({ event: 'request', request }))
  })
})

app.get('/drosses', (_req, res) => {
  res.send(drosses)
})

app.put('/drosses', (req, res) => {
  drosses = req.body
  updateDrosses()
  res.send(drosses)
})

app.post('/file', (req, res) => {
  const filePath = path.join(drosses[req.body.uuid].root, req.body.file)
  const content = fs.readFileSync(filePath, 'utf8')
  res.send({ content })
})

app.put('/start', (req, res) => {
  d.send('start', req.body.uuid)
  res.send()
})

app.put('/stop', (req, res) => {
  d.send('stop', req.body.uuid)
  res.send()
})

app.put('/restart', (req, res) => {
  d.send('restart', req.body.uuid)
  res.send()
})

if (env === 'production') {
  app.use('/', express.static(path.join(__dirname, '..')))
}

getPort({ port: getPort.makeRange(3000, 9999), host: '0.0.0.0' })
  .then(port => {
    if (env !== 'production') {
      fs.writeFileSync('.env.local', `VUE_APP_PORT=${port}`, 'utf8')
    }

    const getAdress = (proto, host, port) => `${proto}://${host}:${port}`
    const ipAddress = ip.address()
    const proto = 'http'
    const hosts = ['localhost', ipAddress]
    const hostsStr = '\n - ' + hosts
      .map(host => getAdress(proto, host, port)).join('\n - ')

    const server = http.createServer(app)

    echo.installHandlers(server, { prefix:'/drosse' })

    server.listen(port, '0.0.0.0')

    console.log(`Environment: ${env}`)
    console.log(`Settings: ${home}`)
    console.log(`Drosse UI running at ${hostsStr}`)
  })