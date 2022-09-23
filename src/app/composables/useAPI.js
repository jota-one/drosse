import logger from '../logger'

import useIO from './useIO'
import useDB from './useDB'
import useState from './useState'

const db = useDB()
const state = useState()
const { loadStatic, loadScraped } = useIO()

export default function useAPI(req, res) {
  return {
    req,
    res,
    db,
    logger,
    io: { loadStatic, loadScraped },
    config: state.get(),
  }
}