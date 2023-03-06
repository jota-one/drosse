const {getRouterParam} = require("h3");
module.exports = function ({ db, event }) {
  const id = getRouterParam(event, 'id')

  db.remove.byId('users', id)

  return { success: true }
}
