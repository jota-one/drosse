import { promises as fs } from 'fs'
import { join } from 'path'
import { fileExists } from '../../helpers'
import useIO from "../composables/useIO";

export default function (vorpal, { config, restart }) {
  const dropDatabase = async () => {
    const { deleteAllUploadedFiles } = useIO()
    const dbFile = join(config.root, config.database)

    if (await fileExists(dbFile)) {
      await fs.rm(dbFile)
    }
    
    await deleteAllUploadedFiles()
    return restart()
  }

  vorpal.command('db drop', 'Delete the database file and the uploaded files.').action(dropDatabase)
}
