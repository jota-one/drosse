<template>
  <div class="Ribbon">
    <div class="wrapper">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Ribbon',
}
</script>

<style lang="postcss" scoped>
.Ribbon {
  position: fixed;
  top: -8.5rem;
  right: -17.3rem;
  width: 30rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  color: black;
  text-align: center;
  background-color: var(--c-green);
  box-shadow: 0 0 0.25rem rgba(0, 0, 0, 0.5);
  transform-origin: 0 0;
  transform: rotate(45deg);
  z-index: 10;
}

.wrapper {
  max-width: 8rem;
}
</style>
