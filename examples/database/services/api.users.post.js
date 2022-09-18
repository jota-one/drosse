const { readBody } = require('h3')

module.exports = async function ({ db, req }) {
  const payload = await readBody(req)

  db.insert('users', [payload.name, payload.id.toString()], payload)

  return { success: true }
}
