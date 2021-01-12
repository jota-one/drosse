<template>
  <div class="Help">
    <clickable class="icon" icon="help" />
  </div>
</template>

<script>
import Clickable from '@/components/common/Clickable'

export default {
  name: 'Help',
  components: { Clickable },
}
</script>

<style lang="postcss" scoped>
.Help {
  position: absolute;
  top: 0;
  right: 0;
}

.icon {
  width: 2.25rem;
  height: 2.25rem;
}

/* Colors */
.icon {
  fill: var(--c-gray-inactive);
  will-change: fill;
  transition: fill 0.1s ease-in;

  &:hover {
    fill: var(--c-help);
  }
}
</style>
