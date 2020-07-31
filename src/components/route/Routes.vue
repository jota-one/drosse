<template>
  <div class="Routes">
    <div class="list">
      <slot />
    </div>
    <Add class="add-route" label="Add route" />
  </div>
</template>

<script>
import Add from '@/components/common/Add'

export default {
  name: 'Routes',
  components: { Add }
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