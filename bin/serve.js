#!/usr/bin/env node
process.title = `node drosse ${process.argv[1]}`

const path = require('path')
const { fork } = require('child_process')
const Discover = require('node-discover')

const d = new Discover({ advertisement: {} })
let forked, uuid

const exitHandler = () => {
  d.send('down', { uuid })
  setTimeout(() => {
    process.exit()
  }, 100)
}

const start = () => {
  const app = fork(
    path.join(__dirname, 'drosse.js'),
    ['serve'].concat(process.argv.slice(2)),
    {
      silent: true,
    }
  )

  app.stdout.on('data', data => {
    `${data}`.split('\n').forEach(msg => {
      d.send('log', { uuid, msg })
    })
    process.stdout.write(`${data}`)
  })

  app.stderr.on('data', data => {
    `${data}`.split('\n').forEach(msg => {
      d.send('log', { uuid, msg })
    })
    process.stderr.write(`${data}`)
  })

  app.on('close', code => {
    if (code !== 0) {
      const msg = `Drosse process exited with code ${code}`
      d.send('log', { uuid, msg })
      console.log(msg)
    }
  })

  app.on('message', ({ event, data }) => {
    if (event === 'uuid') {
      uuid = data
    } else if (event === 'advertise') {
      d.advertise(data)
    } else {
      d.send(event, data)
    }
  })

  return app
}

forked = start()

d.join('start', duuid => {
  if (duuid === uuid) {
    forked = start()
    forked.send({ event: 'start' })
  }
})

d.join('stop', duuid => {
  if (duuid === uuid) {
    forked.send({ event: 'stop' })
    setTimeout(() => {
      forked.kill('SIGINT')
    }, 200)
  }
})

// handle process exits and tell UI we are down
process.stdin.resume()

// app closes
process.on('exit', exitHandler)

// catch ctrl+c event
process.on('SIGINT', exitHandler)

// catch "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler)
process.on('SIGUSR2', exitHandler)

// catch uncaught exceptions
process.on('uncaughtException', exitHandler)
