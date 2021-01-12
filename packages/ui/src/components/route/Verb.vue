<template>
  <button :class="['Verb', { selected, disabled }]">
    {{ type }}
  </button>
</template>

<script>
const TYPES = ['delete', 'get', 'patch', 'post', 'put']

export default {
  name: 'Verb',
  props: {
    type: {
      type: String,
      required: true,
      validator: value => TYPES.includes(value),
    },
    selected: Boolean,
    disabled: Boolean,
  },
}
</script>

<style lang="postcss" scoped>
.Verb {
  margin-right: 0.5rem;
  padding: 0.2rem 0.4rem;
  border-radius: 0.4rem;
  font-size: 0.75rem;
  line-height: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  border: 1px solid;
  letter-spacing: -0.25px;
  will-change: border, color, background-color;
  transition: all 0.1s ease-in-out;
}

/* Colors */
.Verb {
  color: var(--c-app-bg);
  border-color: var(--c-gray-inactive);
  background-color: var(--c-gray-inactive);

  &:hover,
  &.selected {
    border-color: var(--c-green);
    background-color: var(--c-green);
  }

  &.disabled {
    background-size: 0.5rem 0.5rem;
    background-image: var(--c-disabled-verb-bg);
  }
}
</style>
