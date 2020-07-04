<template>
  <footer>
    <span class="dev-by">
      A product developed by
    </span>
    <a href="https://jota.one" target="_blank">
      <Icon class="icon" name="jota" />
    </a>
  </footer>
</template>

<script>
import Icon from '@/components/common/Icon'

export default {
  name: 'Footer',
  components: { Icon }
}
</script>

<style lang="postcss" scoped>
footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: 3rem;
}

.dev-by {
  font-family: sans-serif;
  letter-spacing: 0;
}

a {
  display: flex;
}

.icon {
  width: 3rem;
  height: 3rem;
}

/* Colors */
.dev-by {
  color: var(--c-gray-inactive);
}

.icon {
  fill: var(--c-gray-active);

  &:hover {
    fill: var(--c-green);
  }
}
</style>