// This has to be run with the --esm option:
// `npx @jota-one/drosse serve examples/esm --esm`
// or with the drosse-esm binary:
// `npx drosse-esm serve examples/esm`

import { response } from './templates/response'

export default {
  name: 'ES Module example',
  port: 7003,
  templates: { response }
}
