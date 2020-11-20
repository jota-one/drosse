<template>
  <Middleware
    class="RouteTemplate"
    icon="template"
    :active="Boolean(verb?.template)"
    :inherited="verb.inherited.template"
    :title="`Template: ${verb?.template || 'no template defined'}`"
    :tooltip="verb?.template"
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
  &.active {
    fill: var(--c-blue);
  }
}
</style>
