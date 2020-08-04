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
          <Route
            v-if="i === 0 ? true : showRoute(route)"
            :key="route.fullPath"
            :route="route"
            :show-virtual="showVirtual"
            :isParent="isParent(route)"
            :editing="editorOpened === i"
            class="route"
            @toggle="route.opened = !route.opened"
            @toggle-editor="toggleEditor(i, $event)"
          />
          <div
            :key="`editor.${route.fullPath}`"
            :class="['editor-offset', { opened: editorOpened === i }]"
          />
        </template>
      </Routes>
      <Editor
        :class="['editor', { opened: editorOpened > -1 }]"
        :style="{ top: `${editorTop}px` }"
        :opened="editorOpened > -1"
        @close="closeEditor"
      />
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import useDrosses from '@/modules/drosses'
import useDrosse from '@/modules/drosse'
import useTheme from '@/modules/theme'
import useEditor from '@/modules/editor'
import Clickable from '@/components/common/Clickable'
import DrosseIcon from '@/components/common/DrosseIcon'
import Input from '@/components/common/Input'
import Routes from '@/components/route/Routes'
import Route from '@/components/route/Route'
import Editor from '@/components/Editor'

export default {
  name: 'Detail',
  components: { Clickable, DrosseIcon, Input, Routes, Route, Editor },
  setup () {
    const { drosses } = useDrosses()
    const { theme } = useTheme()
    const { load, unload } = useEditor()
    const { loadHandler } = useDrosse()

    const drosse = computed(() => Object.values(drosses.value)
      .find(drosse => drosse.selected))

    const routes = computed(() => drosse.value.routes
      .filter(route => showVirtual.value ? route : !route.virtual)
    )

    const showRoute = route => !routes.value
      .filter(
        r => r.level < route.level &&
        route.fullPath.includes(r.fullPath)
      )
      .some(parent => !parent.opened)

    const isParent = route => Boolean(routes.value.find(
      r => r.level > route.level &&
      r.fullPath.includes(route.fullPath)
    ))

    const showVirtual = ref(true)
    const editorOpened = ref(-1)
    const editorTop = ref(0)

    const toggleEditor = async (index, handlerValue) => {
      const toggle = index => {
        const closedParents = routes.value
          .filter(r => r.level < index && isParent(r) && !r.opened).length

        editorOpened.value = editorOpened.value > -1 ? -1 : index
        editorTop.value = 40 + ((index - closedParents) * 38) // 38 = 2.5rem with 16px base
      }

      const editing = editorOpened.value

      if (editing > -1 && editing !== index) {
        toggle(editing)
        setTimeout(() => { unload() }, 250)
      }

      toggle(index)

      if (editorOpened.value > -1) {
        const isPath = handlerValue.startsWith('./')
        const value = isPath
          ? await loadHandler(drosse.value, handlerValue)
          : handlerValue

        const language = isPath && handlerValue.endsWith('.json') || !isPath
          ? 'json'
          :'javascript'

        load({
          container: document.getElementById('editor'),
          theme: theme.value,
          value,
          language
        })
      } else {
        setTimeout(() => { unload() }, 250)
      }
    }

    const closeEditor = () => {
      editorOpened.value = -1
    }

    return {
      drosse,
      routes,
      showRoute,
      isParent,
      showVirtual,
      editorOpened,
      editorTop,
      toggleEditor,
      closeEditor
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

.editor,
.editor-offset {
  height: 0;
  will-change: height;
  transition: height .2s ease-in-out;
}

.editor {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 0;

  &.opened {
    margin-top: 1rem;
    height: calc(100vh - 28rem);
    min-height: 35rem;
  }
}

.editor-offset {
  display: table-row;

  &.opened {
    height: calc(100vh - 27rem);
    min-height: 39rem;
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