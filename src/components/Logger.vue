<template>
  <div :class="['Logger', { opened }]">
    <h3>
      <Clickable class="collapse" icon="chevron" @click="opened = !opened" />
      Console
    </h3>
    <div class="wrapper">
      <div v-for="(log, i) in logs" :key="`log-${i}`" v-html="toHtml(log)" />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import Convert from 'ansi-to-html'
import Clickable from '@/components/common/Clickable'
const convert = new Convert()

export default {
  name: 'Logger',
  components: { Clickable },
  props: {
    logs: {
      type: Array,
      default: () => [],
    },
  },
  setup() {
    const opened = ref(true)
    const toHtml = log => convert.toHtml(log)

    return { opened, toHtml }
  },
}
</script>

<style lang="postcss" scoped>
.Logger {
  margin-top: 3rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(128, 128, 128, 0.25);
  max-height: 4rem;
  overflow: hidden;
  transition: max-height 0.1s ease-out;

  &.opened {
    max-height: 34rem;
  }
}

h3 {
  font-weight: 200;
}

.collapse {
  width: 1rem;
  height: 1rem;
  will-change: transform;
  transition: transform 0.1s ease-out;

  .opened & {
    transform: rotate(90deg);
  }
}

.wrapper {
  padding: 2rem;
  max-height: 30rem;
  overflow: auto;
  white-space: nowrap;
}

/* Colors */
.wrapper {
  color: var(--c-logger-txt);
  background-color: var(--c-logger-bg);
}

.collapse {
  fill: var(--c-gray-active);
}
</style>
