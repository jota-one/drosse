<template>
  <Plugin
    class="Throttle"
    icon="throttle"
    :active="Boolean(verb?.throttle)"
    :inherited="verb.inherited.throttle"
    :title="`Throttle request: ${range}`"
    :tooltip="range"
  >
    <Input :value="min" />
    <template v-if="verb?.throttle">
      -
      <Input :value="max" />
    </template>
  </Plugin>
</template>

<script>
import { computed } from 'vue'
import Input from '@/components/common/Input'
import Plugin from './Plugin'

export default {
  name: 'Throttle',
  components: { Plugin, Input },
  props: {
    verb: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const min = computed(() => props.verb?.throttle?.min || 0)
    const max = computed(() => props.verb?.throttle?.max || 0)
    const range = computed(
      () => `${min.value}${max.value ? ' - ' + max.value : ''}`
    )
    const inheritted = computed(() => props.verb?.throttle?.inheritted)

    return { inheritted, min, max, range }
  },
}
</script>

<style lang="postcss" scoped>
/* Colors */
.Plugin ::v-deep(.icon) {
  &.active {
    fill: var(--c-yellow);
  }
}
</style>
