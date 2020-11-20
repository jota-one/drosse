<template>
  <div id="drosse-ui">
    <Suspense>
      <TabBar />
    </Suspense>
    <main>
      <div class="container">
        <Home v-if="viewHome" />
        <Detail
          v-else
          :editor-opened="editorOpened"
          @open-editor="openEditor($event)"
          @close-editor="editorOpened = -1"
          @update-editor="updateEditor($event)"
        />
        <Editor
          :hidden="hideEditor"
          :opened="editorOpened > -1"
          :top="editorTop"
          @close="editorOpened = -1"
        />
        <Help v-if="false" />
      </div>
    </main>
    <Footer />
    <Ribbon>
      Version {{ version }}
      <br />
      <b>Read mode only</b>
    </Ribbon>
  </div>
</template>

<script>
import '../public/fonts/FiraCode/fontface.css'
import '../public/fonts/Oswald/fontface.css'
import p from '../package.json'
import { computed, ref } from 'vue'
import useDrosses from '@/modules/drosses'
import TabBar from '@/components/tabbar/TabBar'
import Home from '@/views/Home'
import Detail from '@/views/Detail'
import Editor from '@/components/Editor'
import Help from '@/components/Help'
import Footer from '@/components/Footer'
import Ribbon from '@/components/Ribbon'

const version = p.version

export default {
  name: 'App',
  components: { TabBar, Home, Detail, Editor, Help, Footer, Ribbon },
  setup() {
    const { drosses, viewHome } = useDrosses()
    const editorOpened = ref(-1)
    const editorTop = ref(0)
    const _drosseEditing = ref({})
    const _hideEditor = ref(false)

    const openEditor = ({ index, top, hide, drosse, delay }) => {
      const open = () => {
        editorOpened.value = index
        editorTop.value = top
        _hideEditor.value = hide
        _drosseEditing.value = drosse
      }

      if (delay) {
        setTimeout(() => {
          open()
        }, 200)
      } else {
        open()
      }
    }

    const updateEditor = ({ top, hide }) => {
      editorTop.value = top
      _hideEditor.value = hide
    }

    const hideEditor = computed(() => {
      const selectedDrosse = Object.values(drosses.value).find(
        drosse => drosse.selected
      )

      return (
        _hideEditor.value ||
        viewHome.value ||
        _drosseEditing.value.uuid !== selectedDrosse.uuid
      )
    })

    return {
      hideEditor,
      editorOpened,
      editorTop,
      openEditor,
      updateEditor,
      version,
      viewHome,
    }
  },
}
</script>

<style lang="postcss">
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-width: 100vw;
  height: 100%;
  min-height: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-size: 15px;
}

body {
  font-family: FiraCode, monospace;
  font-weight: 100;

  &,
  input {
    letter-spacing: -0.5px;
  }

  --c-unavailable-bg: linear-gradient(
    135deg,
    transparent 25%,
    rgba(255, 77, 0, 0.1) 25%,
    rgba(255, 77, 0, 0.1) 50%,
    transparent 50%,
    transparent 75%,
    rgba(255, 77, 0, 0.1) 75%,
    rgba(255, 77, 0, 0.1) 100%
  );
  --s-editor-height: calc(75vh);

  * {
    scrollbar-width: thin;
  }

  *::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  *::-webkit-scrollbar-thumb {
    border-radius: 0;
    border: 0;
  }

  &.dark {
    --c-app-bg: rgb(50, 50, 50);
    --c-black: rgb(0, 0, 0);
    --c-blue: rgb(52, 212, 246);
    --c-disabled-route-bg: linear-gradient(
      135deg,
      transparent 25%,
      rgba(0, 0, 0, 0.2) 25%,
      rgba(0, 0, 0, 0.2) 50%,
      transparent 50%,
      transparent 75%,
      rgba(0, 0, 0, 0.2) 75%,
      rgba(0, 0, 0, 0.2) 100%
    );
    --c-disabled-verb-bg: linear-gradient(
      135deg,
      transparent 25%,
      rgba(0, 0, 0, 0.35) 25%,
      rgba(0, 0, 0, 0.35) 50%,
      transparent 50%,
      transparent 75%,
      rgba(0, 0, 0, 0.35) 75%,
      rgba(0, 0, 0, 0.35) 100%
    );
    --c-gray-active: rgb(150, 150, 150);
    --c-gray-inactive: rgb(95, 95, 95);
    --c-green: rgb(52, 246, 107);
    --c-green-light: rgb(164, 252, 188);
    --c-help: rgb(44, 147, 241);
    --c-logger-bg: rgba(0, 0, 0, 0.9);
    --c-logger-txt: rgba(255, 255, 255, 0.9);
    --c-pink: rgb(203, 93, 205);
    --c-red: rgb(255, 77, 0);
    --c-route-hover: rgb(0, 0, 0, 0.15);
    --c-tabbar-bg: rgb(25, 25, 25);
    --c-white: rgb(255, 255, 255);
    --c-yellow: rgb(255, 230, 0);

    * {
      scrollbar-color: rgba(255, 255, 255, 0.2) rgba(0, 0, 0, 0.2);
    }

    *::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
    }

    *::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }

  &.light {
    --c-app-bg: rgb(255, 255, 255);
    --c-black: rgb(255, 255, 255);
    --c-blue: rgb(52, 212, 246);
    --c-disabled-route-bg: linear-gradient(
      135deg,
      transparent 25%,
      rgba(0, 0, 0, 0.075) 25%,
      rgba(0, 0, 0, 0.075) 50%,
      transparent 50%,
      transparent 75%,
      rgba(0, 0, 0, 0.075) 75%,
      rgba(0, 0, 0, 0.075) 100%
    );
    --c-disabled-verb-bg: linear-gradient(
      135deg,
      transparent 25%,
      rgba(255, 255, 255, 0.35) 25%,
      rgba(255, 255, 255, 0.35) 50%,
      transparent 50%,
      transparent 75%,
      rgba(255, 255, 255, 0.35) 75%,
      rgba(255, 255, 255, 0.35) 100%
    );
    --c-gray-active: rgb(115, 115, 115);
    --c-gray-inactive: rgb(170, 170, 170);
    --c-green: rgb(21, 222, 78);
    --c-green-light: rgb(164, 252, 188);
    --c-help: rgb(44, 147, 241);
    --c-logger-bg: rgba(200, 200, 200, 0.2);
    --c-logger-txt: rgba(0, 0, 0, 0.9);
    --c-pink: rgba(203, 93, 205, 0.75);
    --c-red: rgb(255, 77, 0);
    --c-route-hover: rgb(0, 0, 0, 0.05);
    --c-tabbar-bg: rgb(230, 230, 230);
    --c-white: rgb(0, 0, 0);
    --c-yellow: rgb(255, 208, 0);

    * {
      scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.05);
    }

    *::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
    }

    *::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.2);
    }
  }
}

button {
  margin: 0;
  padding: 0;
  font-family: FiraCode, monospace;
  border: 1px solid transparent;
  background: none;
  cursor: pointer;
  outline: none;
  border-radius: 0.25rem;
  will-change: color, background-color;
  transition: color 0.1s ease-in-out, background-color 0.1s ease-in-out;
}

.spacer {
  flex: 1;
}

#drosse-ui {
  min-width: 423px;
  max-width: 100vw;
  overflow: hidden;

  main {
    padding: 2rem 3rem;
    min-height: calc(100vh - 11rem);
  }

  .container {
    position: relative;
    margin: 0 auto;
    max-width: 2000px;
  }
}

/* Colors */
body {
  color: var(--c-gray-active);
  background-color: var(--c-app-bg);
  will-change: background-color, color;
  transition: background-color 0.1s ease-in-out, color 0.1s ease-in-out;
}

button:focus {
  border-color: var(--c-pink);
}
</style>
