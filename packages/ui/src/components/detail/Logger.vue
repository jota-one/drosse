<template>
  <div :class="['Logger', { opened }]">
    <button class="button" @click="opened = !opened">
      <h3>
        <Icon class="icon" name="chevron" />
        Console
      </h3>
    </button>
    <div class="wrapper">
      <div v-for="(log, i) in logs" :key="`log-${i}`" v-html="toHtml(log)" />
      <div v-if="!logs.length" class="empty">Waiting for logs...</div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import Convert from 'ansi-to-html'
import Icon from '@/components/common/Icon'
const convert = new Convert()

export default {
  name: 'Logger',
  components: { Icon },
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
  margin-top: 1rem;
  padding-top: 1rem;
  max-height: 4rem;
  overflow: hidden;
  transition: max-height 0.1s ease-out;

  &.opened {
    max-height: 34rem;
  }
}

.button {
  display: flex;
  align-items: center;
}

h3 {
  font-weight: 200;
}

.icon {
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

.button {
  color: var(--c-gray-active);
}

.icon {
  fill: var(--c-gray-active);
}

.empty {
  color: var(--c-gray-active);
}
</style>
