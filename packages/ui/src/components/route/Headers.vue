<template>
  <Plugin
    :active="Boolean(verb?.headers)"
    class="Headers"
    icon="header"
    title="Headers"
  >
    <Input :value="JSON.stringify({})" />
  </Plugin>
</template>

<script>
import Input from '@/components/common/Input'
import Plugin from './Plugin'

export default {
  name: 'Headers',
  components: { Plugin, Input },
  props: {
    verb: {
      type: Object,
      default: () => ({}),
    },
  },
}
</script>

<style lang="postcss" scoped>
/* Colors */
.Plugin ::v-deep(.icon) {
  &:hover,
  &.active {
    fill: var(--c-green);
  }
}
</style>
