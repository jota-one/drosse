<template>
  <span :class="['Verb', { selected }]">
    {{ type }}
  </span>
</template>

<script>
const TYPES = ['delete', 'get', 'patch', 'post', 'put']

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
  padding: .2rem .4rem;
  border-radius: .4rem;
  font-size: .75rem;
  line-height: .75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: -.25px;
}

/* Colors */
.Verb {
  color: var(--c-app-bg);
  background-color: var(--c-gray-inactive);

  &.selected {
    background-color: var(--c-green);
  }
}
</style>