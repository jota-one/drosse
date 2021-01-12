<template>
  <footer>
    <div class="container">
      <div class="theme-switch">
        <Clickable
          class="theme-icon"
          :icon="theme === 'dark' ? 'sun' : 'moon'"
          @click="switchTheme"
        />
      </div>
      <a href="https://jota.one" class="by-jota" target="_blank">
        <svg
          :width="byJota.width"
          :height="byJota.height"
          :viewBox="byJota.viewBox"
          v-html="byJota.paths"
        />
      </a>
    </div>
  </footer>
</template>

<script>
import byJota from '@/assets/by-jota.json'
import useTheme from '@/modules/theme'
import Clickable from '@/components/common/Clickable'

export default {
  name: 'Footer',
  components: { Clickable },
  setup() {
    const { theme, switchTheme } = useTheme()
    return { byJota, theme, switchTheme }
  },
}
</script>

<style lang="postcss" scoped>
footer {
  height: 7rem;
  padding: 2rem 3rem;
}

.container {
  justify-content: space-between;
}

.container,
.theme-switch,
.credits {
  display: flex;
  align-items: center;
}

.theme-icon {
  padding: 0.5rem;
  width: 3.25rem;
  height: 3.25rem;
}

a {
  display: flex;
}

.icon {
  width: 2.5rem;
  height: 2.5rem;
}

/* Colors */
.theme-icon {
  fill: var(--c-gray-active);
  will-change: fill;
  transition: fill 0.1s ease-in-out;

  &:hover {
    fill: var(--c-green);
  }
}

.by-jota {
  svg {
    fill: var(--c-gray-active);
    transition: fill 0.1s ease-in-out;

    &:hover {
      fill: var(--c-green);
    }
  }
}
</style>
