module.exports = function ({ db }) {
  return db.query.list('users').map(u => {
    u.powers = (u.powers || []).map(p => db.query.getRef(p))
    return u
  })
}
