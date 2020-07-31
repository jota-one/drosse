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
        <span class="dev-by">
          A product developed by
        </span>
        <a href="https://jota.one" target="_blank">
          <Icon class="icon" name="jota" />
        </a>
      </div>
    </div>
  </footer>
</template>

<script>
import { ref } from 'vue'
import Clickable from '@/components/common/Clickable'
import Icon from '@/components/common/Icon'

export default {
  name: 'Footer',
  components: { Clickable, Icon },
  setup () {
    const theme = ref(document.body.classList.contains('dark')
      ? 'dark'
      : 'light'
    )

    const switchTheme = () => {
      const newTheme = theme.value === 'dark' ? 'light' : 'dark'
      document.body.classList.remove('dark', 'light')
      document.body.classList.add(newTheme)
      theme.value = newTheme
    }

    return { theme, switchTheme }
  }
}
</script>

<style lang="postcss" scoped>
footer {
  margin: 3rem;
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
  width: 3rem;
  height: 3rem;
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
  transition: fill .2s ease-in-out;
}

.dev-by {
  opacity: .75;
  color: var(--c-gray-active);
}

.icon {
  fill: var(--c-gray-active);

  &:hover {
    fill: var(--c-green);
  }
}
</style>