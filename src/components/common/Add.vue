<template>
  <button :class="['Add', { small }]">
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
    label: {
      type: String,
      default: '',
    },
    small: Boolean,
  },
}
</script>

<style lang="postcss" scoped>
.Add {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  font-size: 1rem;

  &.small {
    padding: 0.25rem;
    font-size: 0.8rem;
  }
}

.icon {
  margin: 0 0.5rem 0.25rem 0;
  width: 1rem;
  height: 1rem;

  .small & {
    width: 0.8rem;
    height: 0.8rem;
  }
}

/* Colors */
.Add {
  color: var(--c-gray-active);

  .icon {
    fill: var(--c-gray-active);
    will-change: fill;
    transition: fill 0.2s ease-in-out;
  }

  &:hover {
    color: var(--c-white);

    .icon {
      fill: var(--c-white);
    }
  }
}
</style>
