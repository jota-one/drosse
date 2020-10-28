import endpoints from '@/config/endpoints'

export default function useIo() {
  const fetchDrosses = async () => {
    try {
      const response = await fetch(endpoints.drosses)
      return response.json()
    } catch (e) {
      // eslint-disable-next-line
      console.error(e)
    }
  }

  const browse = async path => {
    try {
      const response = await fetch(endpoints.browse, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      })
      return response.json()
    } catch (e) {
      // eslint-disable-next-line
      console.error(e)
    }
  }

  const importFolder = async path => {
    try {
      await fetch(endpoints.import, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      })
    } catch (e) {
      // eslint-disable-next-line
      console.error(e)
    }
  }

  const fetchConfig = async drosse => {
    const hosts = drosse.hosts
    const port = drosse.port
    const proto = drosse.proto

    try {
      const response = await fetch(`${proto}://${hosts[0]}:${port}/UI`)
      return response.json()
    } catch (e) {
      // eslint-disable-next-line
      console.error(e)
    }
  }

  const saveDrosses = drosses => {
    try {
      fetch(endpoints.drosses, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(drosses),
      })
    } catch (e) {
      // eslint-disable-next-line
      console.log(e)
    }
  }

  const fetchHandler = async (drosse, file) => {
    try {
      const response = await fetch(endpoints.file, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid: drosse.uuid, file }),
      })
      const json = await response.json()
      return {
        content: json.content,
        language: file.endsWith('.json') ? 'json' : 'javascript',
      }
    } catch (e) {
      // eslint-disable-next-line
      console.error(e)
    }

    return {
      language: 'text',
      content: `Failed loading file ${file}`,
    }
  }

  const start = async uuid => {
    try {
      await fetch(endpoints.start, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid }),
      })
    } catch (e) {
      // eslint-disable-next-line
      console.error(e)
    }
  }

  const stop = async uuid => {
    try {
      await fetch(endpoints.stop, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid }),
      })
    } catch (e) {
      // eslint-disable-next-line
      console.error(e)
    }
  }

  const restart = async uuid => {
    try {
      await fetch(endpoints.restart, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid }),
      })
    } catch (e) {
      // eslint-disable-next-line
      console.error(e)
    }
  }

  const openFile = async (uuid, file) => {
    try {
      await fetch(endpoints.open, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid, file }),
      })
    } catch (e) {
      // eslint-disable-next-line
      console.error(e)
    }
  }

  return {
    browse,
    fetchConfig,
    fetchDrosses,
    fetchHandler,
    importFolder,
    openFile,
    restart,
    saveDrosses,
    start,
    stop,
  }
}
