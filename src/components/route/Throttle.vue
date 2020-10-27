<template>
  <Middleware
    :active="Boolean(verb?.throttle)"
    :class="['Throttle', { inheritted }]"
    icon="throttle"
    :title="`Throttle request: ${min}${max ? ' - ' + max : ''}`"
  >
    <Input :value="min" />
    <template v-if="verb?.throttle">
      -
      <Input :value="max" />
    </template>
  </Middleware>
</template>

<script>
import { computed } from 'vue'
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
  setup(props) {
    const min = computed(() => props.verb?.throttle?.min || 0)
    const max = computed(() => props.verb?.throttle?.max || 0)
    const inheritted = computed(() => props.verb?.throttle?.inheritted)

    return { inheritted, min, max }
  },
}
</script>

<style lang="postcss" scoped>
/* Colors */
.Middleware {
  &::v-deep(.icon) {
    &:hover,
    &.active {
      fill: var(--c-yellow);
    }
  }

  &.inheritted {
    &::v-deep(.icon) {
      &:hover,
      &.active {
        fill: red;
      }
    }
  }
}
</style>
