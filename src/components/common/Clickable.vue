<template>
  <button class="Clickable">
    <Icon class="icon" :name="icon" />
  </button>
</template>

<script>
import Icon from '@/components/common/Icon'

export default {
  name: 'Clickable',
  components: { Icon },
  props: {
    icon: {
      type: String,
      default: '',
    },
  },
}
</script>

<style lang="postcss" scoped>
.icon {
  fill: inherit;
}
</style>
