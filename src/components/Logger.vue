<template>
  <div class="Logger">
    <div
      v-for="(log, i) in logs"
      :key="`log-${i}`"
      v-html="toHtml(log)"
    >
    </div>
  </div>
</template>

<script>
import Convert from 'ansi-to-html'
const convert = new Convert()

export default {
  name: 'Logger',
  props: {
    logs: Array
  },
  setup () {
    const toHtml = log => {
      console.log(log)
      return convert.toHtml(log)
    }
    return { toHtml }
  }
}
</script>

<style lang="postcss" scoped>
.Logger {
  margin-top: 2rem;
  padding: 2rem;
  max-height: 30rem;
  overflow: auto;
  white-space: nowrap;
  font-size: .9rem;
}

/* Colors */
.Logger {
  color: var(--c-logger-txt);
  background-color: var(--c-logger-bg);
}
</style>