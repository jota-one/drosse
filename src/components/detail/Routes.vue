<template>
  <div class="Routes">
    <div :class="['list', { showVirtual }]">
      <FilterBar
        :show-virtual="showVirtual"
        :routes="routes"
        @toggle-virtual="$emit('toggle-virtual')"
        @toggle-routes="$emit('toggle-routes', $event)"
        @search="$emit('search', $event)"
      />
      <slot />
    </div>
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
}
</script>

<style lang="postcss" scoped>
.Routes {
  overflow: auto;
}

.list {
  display: table;
  width: 100%;
}

.add-route {
  margin: 2rem 0 0 0.5rem;
}
</style>
