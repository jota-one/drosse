<template>
  <div class="Routes">
    <div class="list">
      <FilterBar
        :show-virtual="showVirtual"
        @toggle-virtual="$emit('toggle-virtual')"
      />
      <slot />
    </div>
    <Add class="add-route" label="Add route" />
  </div>
</template>

<script>
import Add from '@/components/common/Add'
import FilterBar from './FilterBar'

export default {
  name: 'Routes',
  components: { Add, FilterBar },
  props: {
    showVirtual: Boolean
  }
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
  margin: 2rem 0 0 .5rem;
}
</style>