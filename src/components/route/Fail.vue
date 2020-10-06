<template>
  <Middleware
    :active="Boolean(verb?.fail)"
    class="Fail"
    icon="fail"
    title="Randomly fail route"
  >
    <Input :value="verb?.fail?.rate || 0" />
    <Input :value="verb?.fail?.status || 500" />
    <Input :value="JSON.stringify(verb?.fail?.body || {}).replace(/\s/, '')" />
  </Middleware>
</template>

<script>
import Input from '@/components/common/Input'
import Middleware from './Middleware'

export default {
  name: 'Fail',
  components: { Middleware, Input },
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
.Middleware ::v-deep(.icon) {
  &:hover,
  &.active {
    fill: var(--c-red);
  }
}
</style>
