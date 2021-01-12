module.exports = function ({ db, req }) {
  const { id } = req.params

  db.remove.byId('users', id)

  return { success: true }
}
