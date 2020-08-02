import * as SockJS from 'sockjs-client'
import { computed, ref } from 'vue'

const endpoint = '/drosses'
const sock = new SockJS('/drosse')
const drosses = ref({})
const loaded = false

const persist = () => {
  fetch(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(drosses.value)
  })
}

sock.onmessage = async e => {
  const data = JSON.parse(e.data)
  const uuid = data.drosse.uuid

  if (data.event === 'up') {
    drosses.value[uuid] = data.drosse

    const hosts = data.drosse.hosts
    const port = data.drosse.port
    const proto = data.drosse.proto

    try {
      const response = await fetch(`${proto}://${hosts[0]}:${port}/UI`)
      drosses.value[uuid].config = await response.json()
    } catch (_e) {
      // fail silently
    }
  }

  if (data.event === 'down') {
    const d = data.drosse
    drosses.value[d.uuid].up = false
  }

  if (data.event === 'request') {
    const { method, url, uuid } = data.request
    console.log(`>> ${method.toUpperCase()} ${url} (${uuid})`)
  }
}

export default function useDrosses () {
  const loadDrosses = async () => {
    if (loaded) {
      return drosses
    }

    const response = await fetch(endpoint)
    drosses.value = await response.json()

    return drosses
  }

  const openDrosse = uuid => {
    for (const uuid of Object.keys(drosses.value)) {
      drosses.value[uuid].selected = false
    }

    drosses.value[uuid].open = true
    drosses.value[uuid].selected = true
    persist()
  }

  const closeDrosse = uuid => {
    drosses.value[uuid].open = false
    drosses.value[uuid].selected = false
    persist()
  }

  const openHome = () => {
    for (const uuid of Object.keys(drosses.value)) {
      drosses.value[uuid].selected = false
    }
    persist()
  }

  const viewHome = computed(() => !Object.values(drosses.value)
    .some(drosse => drosse.selected))

  return {
    drosses,
    loadDrosses,
    openDrosse,
    closeDrosse,
    openHome,
    viewHome
  }
}


