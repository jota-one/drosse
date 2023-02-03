#!/usr/bin/env node

import Discover from 'node-discover'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
// TODO hook in auto process to get next version, the current way of getting version from package.json will always display the previous verion as it is built before auto does its magic...
import { version } from '../package.json'
import { describe, init, restart, start } from './app'
import serveStatic from './app/static'

import useCLI from './app/composables/useCLI'
import useIO from './app/composables/useIO'

process.title = `node drosse ${process.argv[1]}`

let discover, description, noRepl

const emit = async (event, data) => {
  switch(event) {
    case 'start':
      // Send dicover events
      description = describe()

      if (!Boolean(discover)) {
        discover = new Discover()
        discover.advertise(description)
      }

      try {
        // Discover seems to need some time before being able to
        // send a message right after it has been created...
        setTimeout(() => {
          discover?.send(event, { uuid: description.uuid })
        }, 10)
      } catch(e) {
        console.error(e)
      }

      // Initiate repl mode
      if (Boolean(noRepl)) {
        return
      }

      const io = useIO()
      const cli = useCLI(data, restart)
      const userConfig = await io.getUserConfig(data.root)

      if (userConfig.cli) {
        cli.extend(userConfig.cli)
      }

      cli.start()
      break
    case 'restart':
      restart()
      break
    case 'stop':
      discover?.send(event, { uuid: description.uuid })
      break
    case 'request':
      discover?.send(event, { uuid: description.uuid, ...data })
      break
  }
}

yargs(hideBin(process.argv))
  .usage('Usage: $0 <cmd> [args]')
  .command({
    command: 'describe <rootPath>',
    desc: 'Describe the mock server',
    handler: async argv => {
      await init(argv.rootPath, emit, version)
      console.log(describe())
      process.exit()
    }
  })
  .command({
    command: 'serve <rootPath>',
    desc: 'Run the mock server',
    builder: {
      port: {
        alias: 'p',
        describe: 'HTTP port',
        type: 'number'
      },
      norepl: {
        default: false,
        describe: 'Disable repl mode',
        type: 'boolean'
      },
    },
    handler: async argv => {
      noRepl = argv.norepl
      await init(argv.rootPath, emit, version, argv.port)
      return start()
    }
  })
  .command({
    command: 'static <rootPath>',
    desc: 'Run a static file server',
    builder: {
      port: {
        alias: 'p',
        describe: 'HTTP port',
        type: 'number'
      },
      proxy: {
        alias: 'P',
        describe: 'Proxy requests to another host',
        type: 'string'
      },
    },
    handler: async argv => {
      return serveStatic(argv.rootPath, argv.port, argv.proxy)
    }
  })
  .demandCommand(1)
  .strict()
  .parse()
