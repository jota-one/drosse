#!/usr/bin/env node

import Discover from 'node-discover'
import yargs from 'yargs'
import { join } from 'path'
import { readFile } from 'fs/promises'
import { hideBin } from 'yargs/helpers'
import { describe, init, restart, start } from './app'
import serveStatic from './app/static'

import useCLI from './app/composables/useCLI'
import useIO from './app/composables/useIO'

export const defineDrosseServer = userConfig => userConfig
export const defineDrosseService = handler => handler

process.title = `node drosse ${process.argv[1]}`

let _version, discover, description, noRepl

const getVersion = async () => {
  if (!_version) {
    try {
      const importPath = import.meta.url.replace('file://', '/')
      const packageFile = join(importPath, '..', '..', 'package.json')
      const content = await readFile(packageFile, "utf8")
      _version = JSON.parse(content).version
    } catch(e) {
      console.error('Failed to get Drosse version', e)
    }
  }

  return _version
}

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

function getMatchablePath(path) {
  let stop = false
  return path.replace(/^(.*\/\/)?\/(.*)$/g, '/$2')
    .split('/')
    .reduce((matchablePath, dir) => {
      if (['node_modules', 'dist', 'src'].includes(dir)) {
        stop = true
      }

      if (!stop) {
        matchablePath.push(dir)
      }

      return matchablePath
    }, []).join('/')
}

// Prevent embedded drosse to be loaded a second time due to import/require
// in .drosserc and js services inside mock files.
// When we do:
// ```
// import { defineDrosseServer } from '@jota-one/drosse
// export default defineDrosseServer({...})
// ```
// we load a single index.cjs|mjs file which reacts to the arguments passed
// by the serve|static|describe command and executes it a second time
// although already started from another path.
//
// So we verify that import and require url matches the path the command was
// run from to enable yargs.
if (getMatchablePath(import.meta.url) === getMatchablePath(process.argv[1])) {
  yargs(hideBin(process.argv))
    .usage('Usage: $0 <cmd> [args]')
    .command({
      command: 'describe <rootPath>',
      desc: 'Describe the mock server',
      handler: async argv => {
        const version = await getVersion()
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
        const version = await getVersion()
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
}
