<template>
  <button class="Button">
    {{ label }}
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    label: String
  }
}
</script>

<style lang="postcss" scoped>
.Button {
  padding: .3rem .6rem .25rem;
  font-size: .8rem;
  line-height: 1rem;
  border-radius: .3rem;
}

/* Colors */
.Button {
  color: var(--c-app-bg);
  background-color: var(--c-green);
}
</style>