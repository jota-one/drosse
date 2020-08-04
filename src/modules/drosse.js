export default function useDrosse () {
  const loadHandler = async (drosse, file) => {
    const response = await fetch('/file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uuid: drosse.uuid, file })
    })
    const json = await response.json()
    return json.content
  }

  return { loadHandler }
}
