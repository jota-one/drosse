<template>
  <Middleware
    :active="Boolean(verb?.throttle)"
    class="Throttle"
    icon="throttle"
    title="Throttle request"
  >
    <Input :value="verb?.throttle?.min || 0" />
    <template v-if="verb?.throttle">
      -
      <Input :value="verb?.throttle?.max || 0" />
    </template>
  </Middleware>
</template>

<script>
import Input from '@/components/common/Input'
import Middleware from './Middleware'

export default {
  name: 'Throttle',
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
    fill: var(--c-yellow);
  }
}
</style>
