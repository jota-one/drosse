module.exports = function mw1 (req, res, next) {
  console.log('global mw 1')
  next()
}