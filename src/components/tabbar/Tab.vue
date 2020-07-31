<template>
  <div class="Tab">
    <Status />
    <div class="name">
      cool-app
    </div>
    <button class="close">
      <Icon class="icon" name="close" />
    </button>
  </div>
</template>

<script>
import Icon from '@/components/common/Icon'
import Status from '@/components/common/Status'

export default {
  name: 'Tab',
  components: { Icon, Status }
}
</script>

<style lang="postcss" scoped>
.Tab {
  display: flex;
  padding: 0 .5rem;
  align-items: center;
  height: 2.5rem;
}

.name {
  margin: 0 .5rem;
  white-space: nowrap;
}

.close .icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Colors */
.Tab {
  color: var(--c-white);
  background-color: var(--c-app-bg);
  will-change: color, background-color;
  transition: color .2s ease-in-out, background-color .2s ease-in-out;
}

.close .icon {
  fill: var(--c-gray-inactive);
  will-change: fill;
  transition: fill .2s ease-in-out;
}

</style>