const fs = require('fs')
const path = require('path')
module.exports = function (vorpal, { config, restart }) {
  const dropDatabase = async () => {
    const dbFile = path.join(config.root, config.database)
    await fs.promises.rm(dbFile)
    return restart()
  }

  vorpal.command('db drop', 'Delete the database file.').action(dropDatabase)
}
