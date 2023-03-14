import { handleCors, getRequestHeader } from 'h3'

export default function (event) {
  handleCors(event, {
    origin: getRequestHeader(event, 'origin') || '*',
    methods: [
      'GET',
      'PUT',
      'POST',
      'PATCH',
      'DELETE',
      'OPTIONS',
      'HEAD',
      'CONNECT',
    ],
    allowHeaders: '*',
    credentials: true,
    preflight: {
      statusCode: 204,
    },
  })
}
