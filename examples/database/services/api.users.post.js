module.exports = function ({ db, req }) {
  const payload = req.body

  db.insert('users', [payload.name, payload.id.toString()], payload)

  return { success: true }
}
