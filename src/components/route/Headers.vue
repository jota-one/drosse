<template>
  <Middleware
    :active="Boolean(verb?.headers)"
    class="Headers"
    icon="header"
    title="Headers"
  >
    <Input :value="JSON.stringify({})" />
  </Middleware>
</template>

<script>
import Input from '@/components/common/Input'
import Middleware from './Middleware'

export default {
  name: 'Headers',
  components: { Middleware, Input },
  props: {
    verb: Object
  }
}
</script>

<style lang="postcss" scoped>
/* Colors */
.Middleware ::v-deep(.icon) {
  &:hover,
  &.active {
    fill: var(--c-green);
  }
}
</style>