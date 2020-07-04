<template>
  <div id="app">
    <Tabbar/>
    <Server/>
  </div>
</template>

<script>
import '../public/fonts/FiraCode/fontface.css'
import '../public/fonts/Oswald/fontface.css'
import Tabbar from '@/components/tab/Tabbar'
import Server from '@/views/Server'

export default {
  name: 'App',
  components: { Tabbar, Server }
}
</script>

<style lang="postcss">
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
  border: none;
  background: none;
  cursor: pointer;
}

/* Colors */
body {
  color: var(--c-gray-active);
  background-color: var(--c-app-bg);
}
</style>