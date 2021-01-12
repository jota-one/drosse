<template>
  <Plugin
    :active="Boolean(verb?.fail)"
    class="Fail"
    icon="fail"
    title="Randomly fail route"
  >
    <Input :value="verb?.fail?.rate || 0" />
    <Input :value="verb?.fail?.status || 500" />
    <Input :value="JSON.stringify(verb?.fail?.body || {}).replace(/\s/, '')" />
  </Plugin>
</template>

<script>
import Input from '@/components/common/Input'
import Plugin from './Plugin'

export default {
  name: 'Fail',
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
    fill: var(--c-red);
  }
}
</style>
