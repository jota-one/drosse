<template>
  <button class="add" @click="$emit('clilck')">
    <Icon class="icon" name="plus"/>
  </button>
</template>

<script>
import Icon from '@/components/common/Icon'

export default {
  name: 'Add',
  components: { Icon }
}
</script>

<style lang="postcss" scoped>
.icon {
  fill: var(--c-gray-inactive);
}
</style>