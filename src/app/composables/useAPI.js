import logger from '../logger'

import useIO from './useIO'
import useDB from './useDB'
import useState from './useState'

const db = useDB()
const state = useState()
const { loadStatic, loadScraped, writeUploadedFile } = useIO()

export default function useAPI(event) {
  return {
    event,
    db,
    logger,
    io: { loadStatic, loadScraped, writeUploadedFile },
    config: state.get(),
  }
}
