const fs = require('fs')
const os = require('os')
const { join } = require('path')
const { fork } = require('child_process')
const http = require('http')
const ip = require('ip')
const open = require('open')
const express = require('express')
const bodyParser = require('body-parser')
const sockjs = require('sockjs')
const getPort = require('get-port')
const Discover = require('node-discover')

const env = process.argv[2] || 'production'
const home = join(os.homedir(), '.drosse-ui')
const drossesFile = join(home, 'drosses.json')
const drosseBin = join(
  __dirname,
  '..',
  env === 'production' ? '..' : '',
  'node_modules',
  '@jota-one',
  'drosse',
  'bin'
)
const app = express()
const forked = {}
let notForked = []
let stopped = []
let d

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

const updateDrosses = _drosses => {
  fs.writeFileSync(
    drossesFile,
    JSON.stringify(_drosses || drosses, null, 2),
    'utf8'
  )
}

const up = (d, conn) => {
  drosses[d.uuid] = { ...drosses[d.uuid], ...d }

  const drosse = drosses[d.uuid]

  // Register process as not forked.
  // When process is forked, it is storef in forked beforehand.
  if (!Object.keys(forked).includes(d.uuid) && !notForked.includes(d.uuid)) {
    notForked.push(d.uuid)
  }

  // Kill forked process and cleanup `forked` array if forked process
  // has been stopped (via UI) and its non-forked equivalent is started
  // from a terminal.
  if (Object.keys(forked).includes(d.uuid) && stopped.includes(d.uuid)) {
    forked[d.uuid].kill()
    delete forked[d.uuid]
    notForked.push(d.uuid)
  }

  drosse.up = true
  drosse.lastSeen = drosse.lastSeen || new Date()
  drosses[drosse.uuid].available = fs.existsSync(drosses[drosse.uuid].root)

  updateDrosses()
  conn.write(JSON.stringify({ event: 'up', drosse }))
}

const down = (d, conn, fromUI) => {
  const drosse = drosses[d.uuid]
  let skipWs = false

  if (drosse) {
    drosse.up = false
    drosse.lastSeen = new Date()

    // Remove from `notForked` array if process has been terminated
    // from a terminal (e.g. SIGINT). This case cannot happen with
    // forked processes as theya re always started and stopped from the UI.
    if (!fromUI) {
      notForked = notForked.filter(uuid => uuid !== d.uuid)
    }

    // Don't forward the "down" event to the frontend if process sends
    // a "down" event while its forked equivalent is running.
    // This use case happens when a drosse process has been forked via the UI
    // but its non-forked equivalent has been started in a terminal and got
    // "EADDRINUSE" error. The process doesn't exit autoamtically and the user
    // has to explicitely exit it via SIGINT, which sends a "down event"...
    skipWs =
      Object.keys(forked).includes(d.uuid) &&
      !stopped.includes(d.uuid) &&
      !notForked.includes(d.uuid)
  }

  updateDrosses()

  if (!skipWs) {
    conn.write(JSON.stringify({ event: 'down', drosse }))
  }
}

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

  d.join('up', drosse => {
    up(drosse, conn)
  })

  d.join('down', drosse => {
    down(drosse, conn)
  })

  d.join('downUI', drosse => {
    down(drosse, conn, true)
  })

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
  const filePath = join(drosses[req.body.uuid].root, req.body.file)
  const content = fs.readFileSync(filePath, 'utf8')
  res.send({ content })
})

app.post('/start', (req, res) => {
  const { uuid } = req.body
  const drosse = drosses[uuid]

  // Remove the process from the `stopped`
  stopped = stopped.filter(_uuid => _uuid !== uuid)

  // Fork the process only if it has not already been started via terminal
  // => not present in `noForked` AND not present in `forked`.
  // Store the process's uuid in the `forked` object for further
  // differenciation between forked and not-forked processes.
  if (!notForked.includes(uuid) && !Object.keys(forked).includes(uuid)) {
    forked[uuid] = fork(join(drosseBin, 'serve.js'), ['-r', drosse.root], {
      silent: true,
    })
  } else {
    d.send('start', uuid)
  }

  res.send()
})

app.post('/stop', (req, res) => {
  const { uuid } = req.body

  d.send('stop', uuid)

  if (!stopped.includes(uuid)) {
    stopped.push(uuid)
  }

  res.send()
})

app.post('/restart', (req, res) => {
  const { uuid } = req.body
  d.send('restart', uuid)
  res.send()
})

app.post('/open', (req, res) => {
  const { uuid, file } = req.body
  open(join(drosses[uuid].root, file))
})

app.post('/browse', (req, res) => {
  const { path } = req.body
  const filterDirs = file => {
    try {
      return fs.lstatSync(join(path, file)).isDirectory()
    } catch (_) {
      return false
    }
  }
  const selectable = dir => {
    try {
      const files = fs.readdirSync(join(path, dir))
      return files.includes('.drosserc.js')
    } catch (_) {
      return false
    }
  }

  res.send(
    fs
      .readdirSync(join(path))
      .filter(filterDirs)
      .sort((a, b) =>
        (a.path || '').toLowerCase() < (b.path || '').toLowerCase()
          ? -1
          : (a.path || '').toLowerCase() > (b.path || '').toLowerCase()
          ? 1
          : 0
      )
      .map(file => ({
        path: join(path, file),
        selectable: selectable(file),
      }))
  )
})

app.post('/import', async (req, res) => {
  const description = await new Promise((resolve, reject) => {
    const { path } = req.body
    const args = ['describe', '-r', path]
    const app = fork(join(drosseBin, 'drosse.js'), args, { silent: false })

    app.on('message', ({ event, data }) => {
      if (event === 'describe') {
        resolve(data)
      }
    })
  })

  drosses[description.drosse.uuid] = {
    ...description.drosse,
    lastSeen: new Date(),
    available: true,
  }
  updateDrosses()
  res.send()
})

if (env === 'production') {
  app.use('/', express.static(join(__dirname, '..')))
}

getPort({ port: getPort.makeRange(5000, 9999), host: '0.0.0.0' }).then(port => {
  if (env !== 'production') {
    fs.writeFileSync('.env.local', `VUE_APP_PORT=${port}`, 'utf8')
  }

  const getAdress = (proto, host, port) => `${proto}://${host}:${port}`
  const ipAddress = ip.address()
  const proto = 'http'
  const hosts = ['localhost', ipAddress]
  const hostsStr =
    '\n - ' + hosts.map(host => getAdress(proto, host, port)).join('\n - ')

  const server = http.createServer(app)

  echo.installHandlers(server, { prefix: '/drosse' })

  server.listen(port, '0.0.0.0')

  console.log(`Environment: ${env}`)
  console.log(`Settings: ${home}`)
  console.log(`Drosse UI running at ${hostsStr}`)
})
