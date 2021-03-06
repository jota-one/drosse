<template>
  <div
    :class="[
      'Detail',
      {
        unavailable: !drosse.available,
        showVirtual,
      },
    ]"
  >
    <h2><Input :value="drosse.name" /></h2>
    <section class="config">
      <DrosseIcon
        big
        :up="drosse.up"
        :available="drosse.available"
        :uuid="drosse.uuid"
      />
      <div class="port">:<Input class="input" :value="drosse.port" /></div>
      <div class="root">
        {{ drosse.root }}
      </div>
      <button
        class="file rc-file"
        @click="openFile(drosse.uuid, '.drosserc.js')"
      >
        .drosserc.js
      </button>
      <button
        class="file routes-file"
        @click="openFile(drosse.uuid, `${drosse.routesFile}.json`)"
      >
        {{ drosse.routesFile }}.json
      </button>
    </section>
    <div class="routes-container">
      <Routes
        :show-virtual="showVirtual"
        :routes="routes"
        @toggleRoutes="toggleRoutes"
        @toggleVirtual="showVirtual = !showVirtual"
        @filter="routeFilters = $event"
      >
        <template v-for="(route, i) in routes">
          <template v-if="i === 0 ? true : showRoute(route)">
            <Route
              :key="route.fullPath"
              :route="route"
              :hit="hit.includes(i)"
              :show-virtual="showVirtual"
              :editing="editorOpened === i"
              :class="['route', { editing: editorOpened === i }]"
              @toggleRoute="toggleRoute(route)"
              @selectVerb="selectVerb(route, $event)"
              @toggleEditor="toggleEditor(i, $event)"
              @openFile="openFile(drosse.uuid, $event)"
            />
          </template>
        </template>
      </Routes>
      <div
        v-if="routeFilters.search && routes.length === 0"
        class="filtered-empty"
      >
        You filtered too much...
      </div>
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
import Logger from '@/components/detail/Logger'
import DrosseIcon from '@/components/common/DrosseIcon'
import Input from '@/components/common/Input'
import Routes from '@/components/detail/Routes'
import Route from '@/components/route/Route'

export default {
  name: 'Detail',
  components: { Logger, DrosseIcon, Input, Routes, Route },
  props: {
    drosse: {
      type: Object,
      default: null,
    },
    logs: {
      type: Array,
      default: () => [],
    },
    editorOpened: {
      type: Number,
      default: -1,
    },
  },
  emits: ['close-editor', 'open-editor', 'update-editor'],
  setup(props, { emit }) {
    const { drosses } = useDrosses()
    const { fetchHandler, openFile, saveDrosses } = useIo()
    const { setContent } = useEditor()

    const routeFilters = ref({})
    const showVirtual = ref(true)
    const hit = ref([])
    let editingIndex = -1

    const routes = computed(() =>
      (props.drosse.routes || [])
        .filter(route => (showVirtual.value ? route : !route.virtual))
        .reduce((routes, route, i) => {
          if (Object.keys(routeFilters.value).length === 0) {
            routes.push(route)
          } else {
            const matchSearch = route.fullPath.includes(
              routeFilters.value.search
            )
            const matchVerbs = route.verbs?.reduce(
              (match, verb) =>
                match ||
                routeFilters.value.verbs.length === 0 ||
                routeFilters.value.verbs.includes(verb.type),
              false
            )

            const matching = matchSearch && matchVerbs

            if (matching) {
              if (showVirtual.value) {
                const ancestors = route.fullPath.split('/').slice(1)
                ancestors.pop()
                let path = ''
                for (const part of ancestors) {
                  path += `/${part}`
                  const ancestor = props.drosse.routes.find(
                    r => r.fullPath === path
                  )
                  if (
                    ancestor &&
                    !routes.find(r => r.fullPath === ancestor.fullPath)
                  ) {
                    routes.push(ancestor)
                  }
                }
              }

              routes.push(route)
            }
          }
          return routes
        }, [])
        .map(route => ({
          ...route,
          isParent: Boolean(
            props.drosse.routes.find(
              r => r.level > route.level && r.fullPath.includes(route.fullPath)
            )
          ),
        }))
    )

    const showRoute = route =>
      !showVirtual.value ||
      !routes.value
        .filter(
          r =>
            r.level < route.level && route.fullPath.includes(r.fullPath + '/')
        )
        .some(parent => !parent.opened)

    const getRouteTop = () => {
      return routes.value.filter(
        (route, i) => i < editingIndex && showRoute(route)
      ).length
    }

    const hideEditor = () => {
      return editingIndex > -1 && !showRoute(routes.value[editingIndex])
    }

    const toggleRoute = route => {
      const index = drosses.value[props.drosse.uuid].routes.findIndex(
        r => r.fullPath === route.fullPath
      )
      drosses.value[props.drosse.uuid].routes[index].opened = !route.opened
      emit('update-editor', {
        top: getRouteTop(),
        hide: hideEditor(),
      })
      saveDrosses(drosses.value)
    }

    const toggleRoutes = state => {
      if (['opened', 'closed'].includes(state)) {
        const opened = state === 'opened'
        drosses.value[props.drosse.uuid].routes = drosses.value[
          props.drosse.uuid
        ].routes.map(route => ({
          ...route,
          opened,
        }))
      }
      saveDrosses(drosses.value)
    }

    const selectVerb = (route, verb) => {
      const index = drosses.value[props.drosse.uuid].routes.findIndex(
        r => r.fullPath === route.fullPath
      )
      drosses.value[props.drosse.uuid].routes[index].selected = verb
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
          ? await fetchHandler(props.drosse, handlerValue)
          : { content: handlerValue, language: 'json' }

        setContent(content, language)
        emit('open-editor', {
          index: editingIndex,
          top: getRouteTop(),
          drosse: props.drosse,
          hide: hideEditor(),
          delay,
        })
      } else {
        emit('close-editor')
      }
    }

    bus.on('request', ({ uuid, url }) => {
      if (uuid !== props.drosse.uuid) {
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

    return {
      hit,
      openFile,
      routeFilters,
      routes,
      selectVerb,
      showRoute,
      showVirtual,
      toggleEditor,
      toggleRoute,
      toggleRoutes,
    }
  },
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
    margin-left: -0.25rem;
  }
}

.root {
  white-space: nowrap;
  overflow: auto;
  margin-right: 0.5rem;
  font-size: 0.9rem;
}

.file {
  margin: 0 0.5rem;
  padding: 0.3rem 0.5rem 0.25rem;
  font-size: 0.9rem;
  border-radius: 0.25rem;
}

.routes-container {
  position: relative;
}

.editor-placeholder {
  display: table-row;
  height: 0;
  will-change: height;
  transition: height 0.1s ease-in-out;

  &.editing {
    height: var(--s-editor-height);
  }

  div {
    display: table-cell;
  }
}

.filtered-empty {
  padding: 2.5rem 0 0 1rem;
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

.file {
  color: var(--c-white);
  background-color: var(--c-route-hover);

  &:hover {
    color: var(--c-black);
    background-color: var(--c-green);
  }
}

.route,
.editor-placeholder {
  &:not(.hit):hover,
  &.editing {
    background-color: var(--c-route-hover);
  }
}
</style>
