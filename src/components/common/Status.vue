<template>
  <button class="status">
    <Icon class="icon" name="play"/>
  </button>
</template>

<script>
import Icon from '@/components/common/Icon'

export default {
  name: 'Status',
  components: { Icon }
}
</script>

<style lang="postcss" scoped>
.icon {
  width: 1.25rem;
  height: 1.25rem;
  fill: var(--c-green);
}
</style>