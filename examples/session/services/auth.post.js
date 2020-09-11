module.exports = drosse => {
  drosse.req.session.authenticated = true
  return { success: true }
}
