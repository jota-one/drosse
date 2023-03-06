import { handleCors, getRequestHeader } from 'h3'

export default function(event) {
  handleCors(event, {
    origin: getRequestHeader(event, 'origin') || '*',
    methods: '*',
    allowHeaders: '*',
    credentials: true,
    preflight: {
      statusCode: 204
    }
  })
}
