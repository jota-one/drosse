const { readBody } = require('h3')

module.exports = async function ({ db, req }) {
  const { id } = req.context.params
  const payload = await readBody(req)

  db.update.subItem.append('users', id, 'powers', {
    collection: 'superpowers',
    id: payload.id,
  })

  return { success: true }
}
