<template>
  <Middleware
    :active="Boolean(verb?.template)"
    class="RouteTemplate"
    icon="template"
    :title="`Template: ${verb?.template}`"
  >
    <Input :value="verb.template" />
  </Middleware>
</template>

<script>
import Input from '@/components/common/Input'
import Middleware from './Middleware'

export default {
  name: 'RouteTemplate',
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
    fill: var(--c-blue);
  }
}
</style>
