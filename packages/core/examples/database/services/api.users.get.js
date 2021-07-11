module.exports = function ({ db }) {
  return db.list.all('users').map(u => ({
    ...u,
    powers: (u.powers || []).map(p => db.get.byRef(p))
  }))
}
