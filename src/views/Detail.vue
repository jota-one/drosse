<template>
  <div :class="['Detail', {
    unavailable: !drosse.available,
    showVirtual
  }]">
    <h2><Input :value="drosse.name" /></h2>
    <section class="config">
      <DrosseIcon big :up="drosse.up" :available="drosse.available" />
      <div class="port">
        :<Input class="input" :value="drosse.port" />
      </div>
      <Input class="root" :value="drosse.root" />
      <div class="spacer" />
      <Clickable
        class="stairs-icon"
        icon="stairs"
        @click="showVirtual = !showVirtual"
      />
      <!-- <input placeholder="Search in routes" value="" /> -->
    </section>
    <div class="routes-container">
      <Routes :class="{ showVirtual }">
        <template v-for="(route, i) in routes">
          <template v-if="i === 0 ? true : showRoute(route)">
            <Route
              :key="route.fullPath"
              :route="route"
              :show-virtual="showVirtual"
              :isParent="isParent(route)"
              :editing="editorOpened === i"
              class="route"
              @toggle="toggleRoute(i, route)"
              @toggle-editor="toggleEditor(i, $event)"
            />
            <div
              :key="`editor.${route.fullPath}`"
              :class="['editor-placeholder', { opened: editorOpened === i }]"
            />
          </template>
        </template>
      </Routes>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import useDrosses from '@/modules/drosses'
import useIo from '@/modules/io'
import useEditor from '@/modules/editor'
import Clickable from '@/components/common/Clickable'
import DrosseIcon from '@/components/common/DrosseIcon'
import Input from '@/components/common/Input'
import Routes from '@/components/route/Routes'
import Route from '@/components/route/Route'

export default {
  name: 'Detail',
  components: { Clickable, DrosseIcon, Input, Routes, Route },
  props: {
    editorOpened: Number
  },
  setup (props, { emit }) {
    const { drosses } = useDrosses()
    const { fetchHandler, saveDrosses } = useIo()
    const { setContent } = useEditor()

    let editingIndex = -1
    const showVirtual = ref(true)

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

    return {
      drosse,
      routes,
      showRoute,
      isParent,
      showVirtual,
      toggleRoute,
      toggleEditor
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
  margin-bottom: 1.5rem;
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

.stairs-icon {
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
}

.routes-container {
  position: relative;
}

.editor-placeholder {
  display: table-row;
  height: 0;
  will-change: height;
  transition: height .2s ease-in-out;

  &.opened {
    height: var(--s-editor-height);
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

.stairs-icon {
  fill: var(--c-gray-inactive);
  will-change: fill;
  transition: fill .2s ease-in-out;

  &:hover,
  .showVirtual & {
    fill: var(--c-green);
  }
}
</style>