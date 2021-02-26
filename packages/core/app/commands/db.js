const fs = require('fs')
const path = require('path')
module.exports = function (vorpal, { config }) {
  vorpal.command('db drop', 'Delete the database file').action(function () {
    const dbFile = path.join(config.root, config.database)
    return fs.promises.rm(dbFile)
  })
}
