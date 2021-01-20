const fs = require('fs')
const path = require('path')
module.exports = function (vorpal, state) {
  vorpal.command('db drop', 'Delete the database file').action(function () {
    const dbFile = path.join(state.root, state.database)
    return fs.promises.rm(dbFile)
  })
}
