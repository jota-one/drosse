<template>
  <button :class="['Button', { secondary }]">
    {{ label }}
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    label: {
      type: String,
      default: '',
    },
    secondary: Boolean,
  },
}
</script>

<style lang="postcss" scoped>
.Button {
  padding: 0.3rem 0.6rem 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1rem;
  border: 1px solid;
  border-radius: 0.3rem;
}

/* Colors */
.Button {
  color: var(--c-app-bg);
  border-color: transparent;
  background-color: var(--c-green);

  &.secondary {
    color: var(--c-green);
    border-color: var(--c-green);
    background-color: transparent;
  }
}
</style>
