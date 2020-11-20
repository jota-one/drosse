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
      <div class="credits">
        <span class="dev-by">crafted by</span>
        <a href="https://jota.one" target="_blank">
          <Icon class="icon" name="jota" />
        </a>
      </div>
    </div>
  </footer>
</template>

<script>
import useTheme from '@/modules/theme'
import Clickable from '@/components/common/Clickable'
import Icon from '@/components/common/Icon'

export default {
  name: 'Footer',
  components: { Clickable, Icon },
  setup() {
    const { theme, switchTheme } = useTheme()
    return { theme, switchTheme }
  },
}
</script>

<style lang="postcss" scoped>
footer {
  height: 8rem;
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

.dev-by {
  font-family: sans-serif;
  letter-spacing: 0;
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
  transition: fill 0.2s ease-in-out;

  &:hover {
    fill: var(--c-green);
  }
}

.dev-by {
  opacity: 0.75;
  color: var(--c-gray-active);
}

.icon {
  fill: var(--c-gray-active);

  &:hover {
    fill: var(--c-green);
  }
}
</style>
