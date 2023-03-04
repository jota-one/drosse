const { readBody } = require('h3')

module.exports = async function ({ db, event }) {
  const payload = await readBody(event)

  db.insert('users', [payload.name, payload.id.toString()], payload)

  return { success: true }
}
