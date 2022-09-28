const { readBody } = require('h3')

module.exports = async function ({ db, req }) {
  const { id } = req.context.params
  const payload = await readBody(req)

  console.log(id, payload)
  db.update.byId('users', id, payload)

  return { success: true }
}
