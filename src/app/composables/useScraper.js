import useIO from './useIO'

export default function useScraper() {
  const { getStaticFileName, writeScrapedFile } = useIO()
  
  const staticService = async (json, api) => {
    const { req } = api
    const filename = getStaticFileName(
      req.baseUrl.split('/').slice(1),
      'json',
      req.params,
      req.method,
      req.query,
    )

    await writeScrapedFile(filename, json)
    return true
  }

  return {
    staticService,
  }
}
