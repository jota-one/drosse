// This has to be run with the esm command locally:
// `yarn serve:esm examples/esm`
// or with the drosse-esm binary when embedded in another project:
// `npx drosse-esm serve some-mocks-path`

import { response } from './templates/response'

export default {
  name: 'ES Module example',
  port: 7003,
  templates: { response }
}
