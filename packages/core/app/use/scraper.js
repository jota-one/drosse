const useIo = require('./io')
module.exports = function useScraper() {
  const { getStaticFileName, writeScrapedFile } = useIo()
  const staticService = async (json, api) => {
    const { req } = api
    const filename = getStaticFileName(
      req.baseUrl.split('/').slice(1),
      req.params,
      req.method,
      req.query
    )

    await writeScrapedFile(filename, json)
    return true
  }

  return {
    staticService,
  }
}
