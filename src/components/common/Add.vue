<template>
  <button class="Add">
    <Icon class="icon" name="plus" />
    {{ label }}
  </button>
</template>

<script>
import Icon from '@/components/common/Icon'

export default {
  name: 'Add',
  components: { Icon },
  props: {
    label: String
  }
}
</script>

<style lang="postcss" scoped>
.Add {
  display: flex;
  align-items: center;
  padding: .5rem;
  font-size: 1rem;
}

.icon {
  margin: 0 .5rem .25rem 0;
  width: 1rem;
  height: 1rem;
}

/* Colors */
.Add {
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