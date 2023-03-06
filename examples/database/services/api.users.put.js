const { readBody, getRouterParam } = require('h3')

module.exports = async function ({ db, event }) {
  const id = getRouterParam(event, 'id')
  const payload = await readBody(event)

  console.log(id, payload)
  db.update.byId('users', id, payload)

  return { success: true }
}
