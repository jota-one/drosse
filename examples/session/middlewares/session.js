const session = require('express-session')
module.exports = session({
  secret: 'drosse',
  cookie: { maxAge: 2 * 60 * 60 * 1000 },
  resave: false,
  saveUninitialized: false,
  httpOnly: false,
})
