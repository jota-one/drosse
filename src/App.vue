<template>
  <div id="drosse-ui">
    <Suspense>
      <TabBar />
    </Suspense>
    <main>
      <div class="container">
        <Home v-if="viewHome" />
        <Detail v-else />
        <Help />
      </div>
    </main>
    <Footer />
  </div>
</template>

<script>
import '../public/fonts/FiraCode/fontface.css'
import '../public/fonts/Oswald/fontface.css'
import useDrosses from '@/modules/drosses'
import TabBar from '@/components/tabbar/TabBar'
import Home from '@/views/Home'
import Detail from '@/views/Detail'
import Help from '@/components/Help'
import Footer from '@/components/Footer'

export default {
  name: 'App',
  components: { TabBar, Home, Detail, Help, Footer },
  setup () {
    const { viewHome } = useDrosses()
    return { viewHome }
  }
}
</script>

<style lang="postcss">
* {
  box-sizing: border-box;
}

html, body {
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

  &, input {
    letter-spacing: -0.5px;
  }

  --c-unavailable-bg: linear-gradient(
    135deg,
    transparent 25%,
    rgba(255,77,0, .1) 25%,
    rgba(255,77,0, .1) 50%,
    transparent 50%,
    transparent 75%,
    rgba(255,77,0, .1) 75%,
    rgba(255,77,0, .1) 100%
  );

  &.dark {
    --c-app-bg: rgb(50,50,50);
    --c-black: rgb(0,0,0);
    --c-blue: rgb(52,212,246);
    --c-gray-active: rgb(150,150,150);
    --c-gray-inactive: rgb(95,95,95);
    --c-green: rgb(52,246,107);
    --c-green-light: rgb(164,252,188);
    --c-help: rgb(44,147,241);
    --c-pink: rgb(203,93,205);
    --c-red: rgb(255,77,0);
    --c-tabbar-bg: rgb(25,25,25);
    --c-white: rgb(255,255,255);
    --c-yellow: rgb(255,230,0);
  }

  &.light {
    --c-app-bg: rgb(255,255,255);
    --c-black: rgb(255,255,255);
    --c-blue: rgb(52,212,246);
    --c-gray-active: rgb(115,115,115);
    --c-gray-inactive: rgb(170,170,170);
    --c-green: rgb(21,222,78);
    --c-green-light: rgb(164,252,188);
    --c-help: rgb(44,147,241);
    --c-pink: rgba(203,93,205, .75);
    --c-red: rgb(255,77,0);
    --c-tabbar-bg: rgb(230,230,230);
    --c-white: rgb(0,0,0);
    --c-yellow: rgb(255,230,0);
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
  border-radius: .25rem;
  will-change: color, background-color;
  transition: color .2s ease-in-out, background-color .2s ease-in-out;
}

.spacer {
  flex: 1;
}

#drosse-ui {
  min-width: 423px;

  main {
    padding: 2rem 3rem 4rem;
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
  transition: background-color .2s ease-in-out, color .2s ease-in-out;
}

button:focus {
  border-color: var(--c-pink);
}
</style>