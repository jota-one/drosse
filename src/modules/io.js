
export default function useIo () {
  const fetchDrosses = async () => {
    const response = await fetch('/drosses')
    return response.json()
  }

  const saveDrosses = drosses => {
    fetch('/drosses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(drosses)
    })
  }

  const fetchHandler = async (drosse, file) => {
    try {
      const response = await fetch('/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid: drosse.uuid, file })
      })
      const json = await response.json()
      return {
        content: json.content,
        language: file.endsWith('.json') ? 'json' : 'javascript'
      }
    } catch(e) {
      console.error(e)
    }

    return {
      language: 'text',
      content: `Failed loading file ${file}`
    }
  }

  return { fetchDrosses, fetchHandler, saveDrosses }
}
