<template>
  <div class="Routes">
    <div class="list">
      <slot />
    </div>
    <AddRoute />
  </div>
</template>

<script>
import AddRoute from './AddRoute'

export default {
  name: 'Routes',
  components: { AddRoute }
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
</style>