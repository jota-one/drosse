<template>
  <div id="app">
    <TabBar />
    <main>
      <Server />
      <Help />
    </main>
  </div>
</template>

<script>
import '../public/fonts/FiraCode/fontface.css'
import '../public/fonts/Oswald/fontface.css'
import TabBar from '@/components/tabbar/TabBar'
import Server from '@/views/Server'
import Help from '@/components/Help'

export default {
  name: 'App',
  components: { TabBar, Server, Help }
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
  min-height: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-size: 15px;
}

body {
  font-family: FiraCode, monospace;
  font-size: 1rem;
  font-weight: 100;
  color: var(--c-gray-active);

  &, input {
    letter-spacing: -0.5px;
  }
}

button {
  margin: 0;
  padding: 0;
  border: 1px solid transparent;
  background: none;
  cursor: pointer;
  outline: none;
  border-radius: .25rem;

  &:focus {
    border-color: var(--c-gray-inactive);
  }
}

#app {
  main {
    position: relative;
    margin: 2rem 3rem;
  }
}

/* Colors */
body {
  color: var(--c-gray-active);
  background-color: var(--c-app-bg);
}
</style>