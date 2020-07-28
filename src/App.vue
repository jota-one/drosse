<template>
  <div id="app">
    <TabBar />
    <main>
      <Server />
      <Help />
    </main>
    <Footer />
  </div>
</template>

<script>
import '../public/fonts/FiraCode/fontface.css'
import '../public/fonts/Oswald/fontface.css'
import * as SockJS from 'sockjs-client'
import TabBar from '@/components/tabbar/TabBar'
import Server from '@/views/Server'
import Help from '@/components/Help'
import Footer from '@/components/Footer'

export default {
  name: 'App',
  components: { TabBar, Server, Help, Footer },
  setup () {
    var sock = new SockJS('/drosse')

    sock.onopen = () => {}

    sock.onmessage = async e => {
      const { event, adv } = JSON.parse(e.data)
      const { name, proto, host, port, root } = adv

      if (event === 'up') {
        const response = await fetch(`${proto}://${host}:${port}/UI`)
        const config = await response.json()

        console.log(`"${name}" [:${port}] is up`)
        console.log('-> root', root)
        console.log('-> config', config)
      }

      if (event === 'down') {
        console.log(`"${name}" [:${port}] went down`)
      }
    }

    sock.onclose = () => {
      console.log('close')
    }
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
  font-family: FiraCode, monospace;
  border: 1px solid transparent;
  background: none;
  cursor: pointer;
  outline: none;
  border-radius: .25rem;

  &:focus {
    border-color: var(--c-pink);
  }
}

#app {
  main {
    position: relative;
    margin: 2rem 3rem;
    min-height: calc(100vh - 13rem);
  }
}

/* Colors */
body {
  color: var(--c-gray-active);
  background-color: var(--c-app-bg);
}
</style>