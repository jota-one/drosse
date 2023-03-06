const { readBody, getRouterParam } = require('h3')

module.exports = async function ({ db, event }) {
  const id = getRouterParam(event, 'id')
  const payload = await readBody(event)

  db.update.subItem.append('users', id, 'powers', {
    collection: 'superpowers',
    id: payload.id,
  })

  return { success: true }
}
