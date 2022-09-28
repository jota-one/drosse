import { getRequestHeader, setResponseHeaders } from 'h3'

export default function(req, res) {
  setResponseHeaders(res, {
    'Access-Control-Allow-Credentials': true,
    ...(getRequestHeader(req, 'origin')
      ? { 'Access-Control-Allow-Origin': getRequestHeader(req, 'origin') }
      : {}
    ),
    'Access-Control-Allow-Methods': 'GET, PUT, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, Content-Length, X-Requested-With'
  })

  // intercept OPTIONS method
  if (req.method === 'OPTIONS') {
    res.statusCode = 200
  }
}
