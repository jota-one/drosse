<template>
  <div :class="['Detail', {
    unavailable: !drosse.available,
    showVirtual
  }]">
    <h2><Input :value="drosse.name" /></h2>
    <section class="config">
      <DrosseIcon
        big
        :up="drosse.up"
        :available="drosse.available"
        :uuid="drosse.uuid"
      />
      <div class="port">
        :<Input class="input" :value="drosse.port" />
      </div>
      <Input class="root" :value="drosse.root" />
    </section>
    <div class="routes-container">
      <Routes
        :show-virtual="showVirtual"
        @toggle-virtual="showVirtual = !showVirtual"
      >
        <template v-for="(route, i) in routes">
          <template v-if="i === 0 ? true : showRoute(route)">
            <Route
              :key="route.fullPath"
              :route="route"
              :hit="hit.includes(i)"
              :show-virtual="showVirtual"
              :isParent="isParent(route)"
              :editing="editorOpened === i"
              :class="['route', { editing: editorOpened === i }]"
              @toggle-route="toggleRoute(i, route)"
              @select-verb="selectVerb(route, $event)"
              @toggle-editor="toggleEditor(i, $event)"
            />
            <div
              :key="`editor.${route.fullPath}`"
              :class="['editor-placeholder', { editing: editorOpened === i }]"
            ><div v-for="i in [...Array(8).keys()]" :key="i"/></div>
          </template>
        </template>
      </Routes>
      <Logger :logs="logs" />
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import useDrosses from '@/modules/drosses'
import useIo from '@/modules/io'
import useEditor from '@/modules/editor'
import bus from '@/bus'
import Logger from '@/components/Logger'
import DrosseIcon from '@/components/common/DrosseIcon'
import Input from '@/components/common/Input'
import Routes from '@/components/route/Routes'
import Route from '@/components/route/Route'

export default {
  name: 'Detail',
  components: { Logger, DrosseIcon, Input, Routes, Route },
  props: {
    editorOpened: Number
  },
  setup (props, { emit }) {
    const { drosses } = useDrosses()
    const { fetchHandler, saveDrosses } = useIo()
    const { setContent } = useEditor()

    const showVirtual = ref(true)
    const hit = ref([])
    const logs = ref([])
    let editingIndex = -1

    const drosse = computed(() => Object.values(drosses.value)
      .find(drosse => drosse.selected))

    const routes = computed(() => drosse.value.routes
      .filter(route => showVirtual.value ? route : !route.virtual)
    )

    const showRoute = route => !routes.value.filter(
      r => r.level < route.level &&
      route.fullPath.includes(r.fullPath)
    ).some(parent => !parent.opened)

    const isParent = route => Boolean(routes.value.find(
      r => r.level > route.level &&
      r.fullPath.includes(route.fullPath)
    ))

    const getRouteTop = () => {
      return routes.value
        .filter((route, i) => i < editingIndex && showRoute(route)).length
    }

    const hideEditor = () => {
      return editingIndex > -1 && !showRoute(routes.value[editingIndex])
    }

    const toggleRoute = (index, route) => {
      route.opened = !route.opened
      emit('update-editor', {
        top: getRouteTop(),
        hide: hideEditor()
      })
      saveDrosses(drosses.value)
    }

    const selectVerb = (route, verb) => {
      route.selected = verb
      saveDrosses(drosses.value)
    }

    const toggleEditor = async (index, handlerValue) => {
      editingIndex = props.editorOpened

      let delay = false

      const toggle = index => {
        editingIndex = editingIndex > -1 ? -1 : index
      }

      if (editingIndex > -1 && editingIndex !== index) {
        delay = true
        toggle(editingIndex)
        emit('close-editor')
      }

      toggle(index)

      if (editingIndex > -1) {
        const isPath = handlerValue.startsWith('./')
        const { content, language } = isPath
          ? await fetchHandler(drosse.value, handlerValue)
          : { content: handlerValue, language: 'json' }

        setContent(content, language)
        emit('open-editor', {
          index: editingIndex,
          top: getRouteTop(),
          drosse: drosse.value,
          hide: hideEditor(),
          delay
        })
      } else {
        emit('close-editor')
      }
    }

    bus.on('request', ({ uuid, url }) => {
      if (uuid !== drosse.value.uuid) {
        return
      }

      const index = routes.value.findIndex(route => route.fullPath === url)

      if (index > -1 && !hit.value.includes(index)) {
        hit.value.push(index)
        setTimeout(() => {
          hit.value = hit.value.filter(i => i !== index)
        }, 250)
      }
    })

    bus.on('log', ({ uuid, msg }) => {
      if (uuid !== drosse.value.uuid) {
        return
      }

      logs.value.push(msg)
    })

    return {
      drosse,
      routes,
      showRoute,
      isParent,
      showVirtual,
      toggleRoute,
      selectVerb,
      toggleEditor,
      hit,
      logs
    }
  }
}
</script>

<style lang="postcss" scoped>
h2 {
  display: inline-flex;
  margin: 0;
  padding: 0;
  font-size: 1.2rem;
  font-weight: 400;
}

.config {
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  border-bottom: 1px dashed;
}

.port {
  display: flex;
  align-items: center;
  margin-right: 1rem;

  .input {
    margin-left: -.25rem;
  }
}

.root {
  font-size: .9rem;
}

.routes-container {
  position: relative;
}

.editor-placeholder {
  display: table-row;
  height: 0;
  will-change: height;
  transition: height .2s ease-in-out;

  &.editing {
    height: var(--s-editor-height);
  }

  div {
    display: table-cell;
  }
}

/* Colors */
.port {
  color: var(--c-green);

  .unavailable & {
    color: var(--c-red);
  }
}

.config {
  border-bottom-color: var(--c-gray-inactive);
}

.route,
.editor-placeholder {
  &:not(.hit):hover,
  &.editing {
    background: var(--c-route-hover);
  }
}
</style>