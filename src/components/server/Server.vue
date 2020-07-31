<template>
  <div :class="['Server', { up: server.up }]">
    <div class="col">
      <Drosse class="drosse" :up="server.up"/>
    </div>
    <div class="col port">{{ server.port }}</div>
    <div class="col name">{{ server.name }}</div>
    <div class="col root">{{ server.root }}</div>
    <div class="col">{{ server.version }}</div>
    <div class="col">{{ server.bin }}</div>
    <div class="col last-seen">{{ lastSeen }}</div>
    <div class="col delete">
      <Clickable class="delete-icon" icon="minus"/>
    </div>
  </div>
</template>

<script>
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict/index'
import { computed } from 'vue'
import Drosse from '@/components/common/Drosse'
import Clickable from '@/components/common/Clickable'

export default {
  name: 'Server',
  components: { Drosse, Clickable },
  props: {
    server: Object
  },
  setup (props) {
    const lastSeen = computed(() =>
      formatDistanceToNowStrict(props.server.lastSeen)
    )

    return { lastSeen }
  }
}
</script>

<style lang="postcss" scoped>
.Server {
  display: table-row;
}

.col {
  display: table-cell;
  vertical-align: middle;
  white-space: nowrap;
  padding: .75rem .5rem .75rem 1rem;
  border-bottom: 1px solid;

  &.name,
  &.port,
  &.root {
    font-weight: 400;
  }

  &.delete {
    margin-left: 1rem;
  }
}

.drosse {
  width: 4rem;
  width: 4rem;
}

.delete-icon {
  width: 1.5rem;
  width: 1.5rem;
}

/* Colors */
.Server.up {
  .port {
    color: var(--c-green);
  }

  .name,
  .root {
    color: var(--c-white);
  }
}

.col {
  border-bottom-color: rgba(128,128,128, .2);
}

.delete-icon {
  fill: var(--c-green);
}
</style>