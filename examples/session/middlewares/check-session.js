module.exports = function checkSession (req, res) {
  if (req.url === '/auth' && req.method === 'POST') {
    return
  }

  if (!req.session.authenticated) {
    const msg =
      '<h2>You\'re not authenticated</h2><br>Run <pre style="display:inline">fetch("/auth", { method: "post" })</pre> in the browser\'s console to authenticate and <b>refresh this page</b>'
    res.statusCode = 401
    return msg
  }
}
