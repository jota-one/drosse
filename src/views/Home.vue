<template>
  <div class="Home">
    <div class="header">
      <h2>Latest <em>Drosse</em> instances</h2>
      <Add
        v-if="servers.length"
        class="new-server"
        label="New server"
      />
    </div>
    <Servers v-if="servers.length">
      <Server
        v-for="(server, i) in servers"
        :key="`server-${i}`"
        :server="server"
      />
    </Servers>
    <div class="empty" v-else>
      <p>No server found...</p>
      <Add label="Create server"/>
    </div>
  </div>
</template>

<script>
import Add from '@/components/common/Add'
import Servers from '@/components/server/Servers'
import Server from '@/components/server/Server'

export default {
  name: 'Home',
  components: { Add, Servers, Server },
  setup () {
    return {
      servers: [
        {
          up: true,
          port: 8000,
          name: 'cool-app',
          root: '/Users/tadai/dev/cool-app',
          bin: '/Users/tadai/dev/cool-app/node_modules/drosse/bin/drosse.js',
          version: '0.1.9',
          lastSeen: new Date()
        }
      ]
    }
  }
}
</script>

<style lang="postcss" scoped>
.header {
  display: flex;
  align-items: center;
  padding: 2rem 0 1rem;
  border-bottom: 1px dashed;
}

h2 {
  margin: 0 1rem 1rem 0;
  font-weight: 400;
  font-size: 1.2rem;
}

em {
  font-family: Oswald, sans-serif;
  font-weight: 500;
  font-size: 1.2rem;
  font-style: normal;
  text-transform: uppercase;
}

.new-server {
  margin-bottom: .75rem;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

/* Colors */
.header {
  border-bottom-color: var(--c-gray-inactive);
}
</style>