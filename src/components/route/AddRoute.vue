<template>
  <button class="AddRoute">
    <Icon class="icon" name="plus" />
    Add route
  </button>
</template>

<script>
import Icon from '@/components/common/Icon'

export default {
  name: 'AddRoute',
  components: { Icon }
}
</script>

<style lang="postcss" scoped>
.AddRoute {
  display: flex;
  align-items: center;
  margin: 1rem 0 0 1.25rem;
  padding: .5rem;
  font-size: 1.1rem;
}

.icon {
  margin: 0 .5rem .25rem 0;
  width: 1rem;
  height: 1rem;
}

/* Colors */
.AddRoute {
  color: var(--c-gray-active);

  .icon {
    fill: var(--c-gray-active);
  }

  &:hover {
    color: var(--c-white);

    .icon {
      fill: var(--c-white);
    }
  }
}
</style>