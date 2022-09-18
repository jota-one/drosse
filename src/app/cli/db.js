import { promises as fs } from 'fs'
import { join } from 'path'

export default function (vorpal, { config, restart }) {
  const dropDatabase = async () => {
    const dbFile = join(config.root, config.database)
    await fs.rm(dbFile)
    return restart()
  }

  vorpal.command('db drop', 'Delete the database file.').action(dropDatabase)
}
