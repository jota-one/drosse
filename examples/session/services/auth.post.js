module.exports = ({ event }) => {
  event.node.req.session.authenticated = true
  return { success: true }
}
