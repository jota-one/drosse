module.exports = function ({ db, req }) {
  const { id } = req.params
  const payload = req.body

  db.update.subItem.append('users', id, 'powers', {
    collection: 'superpowers',
    id: payload.id,
  })

  return { success: true }
}
