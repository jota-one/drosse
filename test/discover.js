const Discover = require('node-discover')

const discover = new Discover()

discover.on('added', data => {
  console.log('added', data)
})

discover.join('start', ({ uuid }) => {
  console.log('started', uuid)
})

discover.join('stop', ({ uuid }) => {
  console.log('stopped', uuid)
})

discover.join('request', ({ uuid, url, method }) => {
  console.log('requested', uuid, url, method)
})

discover.join('log', ({ uuid, msg }) => {
  console.log('logged', uuid, msg)
})