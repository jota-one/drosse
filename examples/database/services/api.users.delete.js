module.exports = function ({ db, req }) {
  const { id } = req.context.params

  db.remove.byId('users', id)

  return { success: true }
}
