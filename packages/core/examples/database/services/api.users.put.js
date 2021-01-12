module.exports = function ({ db, req }) {
  const { id } = req.params
  const payload = req.body

  db.update.byId('users', id, payload)

  return { success: true }
}
