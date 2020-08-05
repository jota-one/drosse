import * as SockJS from 'sockjs-client'
import { computed, ref } from 'vue'
import endpoints from '@/config/endpoints'
import useRoutes from './routes'
import useIo from './io'

const { getRoutes } = useRoutes()
const { fetchConfig, fetchDrosses, saveDrosses } = useIo()

const sock = new SockJS(endpoints.ws)
const drosses = ref({})
const loaded = false

sock.onmessage = async e => {
  const data = JSON.parse(e.data)
  const uuid = data.drosse.uuid

  if (data.event === 'up') {
    drosses.value[uuid] = data.drosse

    const config = await fetchConfig(data.drosse)

    if (config) {
      drosses.value[uuid].routes = getRoutes(config, drosses.value[uuid].routes)
      saveDrosses(drosses.value)
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

    const _drosses = await fetchDrosses()

    if (_drosses) {
      drosses.value = _drosses
    }

    return drosses
  }

  const openDrosse = uuid => {
    for (const uuid of Object.keys(drosses.value)) {
      drosses.value[uuid].selected = false
    }

    drosses.value[uuid].open = true
    drosses.value[uuid].selected = true
    saveDrosses(drosses.value)
  }

  const closeDrosse = uuid => {
    drosses.value[uuid].open = false
    drosses.value[uuid].selected = false
    saveDrosses(drosses.value)
  }

  const openHome = () => {
    for (const uuid of Object.keys(drosses.value)) {
      drosses.value[uuid].selected = false
    }
    saveDrosses(drosses.value)
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


