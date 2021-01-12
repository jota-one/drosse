<template>
  <Plugin
    class="RouteTemplate"
    icon="template"
    :active="Boolean(verb?.template)"
    :inherited="verb.inherited.template"
    :title="`Template: ${verb?.template || 'no template defined'}`"
    :tooltip="verb?.template"
  >
    <Input :value="verb.template" />
  </Plugin>
</template>

<script>
import Input from '@/components/common/Input'
import Plugin from './Plugin'

export default {
  name: 'RouteTemplate',
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
  &.active {
    fill: var(--c-blue);
  }
}
</style>
