<template>
  <div class="Routes">
    <div class="list">
      <FilterBar
        :show-virtual="showVirtual"
        @toggle-virtual="$emit('toggle-virtual')"
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
