<template>
  <button :class="['Verb', { selected, all: type === 'all' }]">
    {{ type }}
  </button>
</template>

<script>
const TYPES = ['all', 'delete', 'get', 'patch', 'post', 'put']

export default {
  name: 'Verb',
  props: {
    type: {
      type: String,
      required: true,
      validator: value => TYPES.includes(value)
    },
    selected: Boolean
  }
}
</script>

<style lang="postcss" scoped>
.Verb {
  margin-right: .5rem;
  padding: .2rem .4rem;
  border-radius: .4rem;
  font-size: .75rem;
  line-height: .75rem;
  font-weight: 700;
  text-transform: uppercase;
  border: 1px solid;
  letter-spacing: -.25px;
  will-change: border, color, background-color;
  transition: all .2s ease-in-out;
}

/* Colors */
.Verb {
  color: var(--c-app-bg);
  border-color: var(--c-gray-inactive);
  background-color: var(--c-gray-inactive);

  &.all {
    color: var(--c-gray-inactive);
    background-color: transparent;
  }

  &.selected {
    border-color: var(--c-green);
    background-color: var(--c-green);

    &.all {
      color: var(--c-green);
      background-color: transparent;
    }
  }
}
</style>