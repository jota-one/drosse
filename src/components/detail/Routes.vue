<template>
  <div class="Routes">
    <table :class="['routes', { showVirtual }]">
      <FilterBar
        :show-virtual="showVirtual"
        :routes="routes"
        @toggleVirtual="$emit('toggle-virtual')"
        @toggleRoutes="$emit('toggle-routes', $event)"
        @filter="$emit('filter', $event)"
      />
      <slot />
    </table>
  </div>
</template>

<script>
import FilterBar from './FilterBar'

export default {
  name: 'Routes',
  components: { FilterBar },
  props: {
    showVirtual: Boolean,
    routes: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['filter', 'toggle-routes', 'toggle-virtual'],
}
</script>

<style lang="postcss">
table.routes {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;

  tr {
    border-collapse: collapse;
    border-spacing: 0;
  }

  tr,
  td {
    margin: 0;
    padding: 0;
  }

  td .inner {
    min-height: 3rem;
  }
}
</style>

<style lang="postcss" scoped>
.Routes {
  overflow: auto;
}
</style>
