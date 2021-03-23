#!/usr/bin/env node
process.title = `node drosse ${process.argv[1]}`

const { fork } = require('child_process')
const path = require('path')
const yargs = require('yargs')
const Discover = require('node-discover')
const useIo = require('../app/use/io')

const d = new Discover({ advertisement: {} })
const cmd = yargs.argv._[0]
let forked, uuid, io, cli

const exitHandler = () => {
  d.send('down', { uuid })
  setTimeout(() => {
    if (forked) {
      console.log('killing', forked.pid)
      forked.kill('SIGINT')
    }
    process.exit()
  }, 100)
}

const start = () => {
  const app = fork(
    path.join(__dirname, 'app.js'),
    [cmd].concat(process.argv.slice(2)),
    { silent: true }
  )

  if (app.stdout) {
    app.stdout.on('data', data => {
      // eslint-disable-next-line
      ;`${data}`.split('\n').forEach(msg => {
        d.send('log', { uuid, msg })
      })
      process.stdout.write(`${data}`)
    })
  }

  if (app.stderr) {
    app.stderr.on('data', data => {
      // eslint-disable-next-line
      ;`${data}`.split('\n').forEach(msg => {
        d.send('log', { uuid, msg })
      })
      process.stderr.write(`${data}`)
    })
  }

  app.on('close', code => {
    if (code !== 0) {
      const msg = `Drosse process exited with code ${code}`
      d.send('log', { uuid, msg })
      console.log(msg)
    }
  })

  app.on('message', async ({ event, data }) => {
    let userConfig
    switch (event) {
      case 'uuid':
        uuid = data
        break
      case 'advertise':
        d.advertise(data)
        break
      case 'ready':
        if (io) {
          break
        }
        io = useIo()
        cli = require('../app/use/cli')(data, app, forked, restart)
        userConfig = await io.getUserConfig(data.root)
        if (userConfig.cli) {
          cli.extend(userConfig.cli)
        }
        cli.start()
        break
      default:
        d.send(event, data)
    }
  })

  console.log(`process started: ${app.pid}`)

  return app
}

const stop = () => {
  forked.send({ event: 'stop' })
  setTimeout(() => {
    forked.kill('SIGINT')
  }, 200)
}

const restart = () => {
  stop()
  setTimeout(() => (forked = start()), 1000)
}

forked = start()

if (cmd === 'serve') {
  d.join('start', duuid => {
    if (duuid === uuid) {
      forked = start()
      forked.send({ event: 'start' })
    }
  })

  d.join('stop', duuid => {
    if (duuid === uuid) {
      stop()
    }
  })

  d.join('cmd', data => {
    if (data.uuid === uuid) {
      forked.send({ event: 'cmd', data })
    }
  })
}

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
