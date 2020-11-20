<template>
  <svg class="icon" viewBox="0 0 25 25" :style="color ? `fill:${color}` : ''">
    <path
      v-for="(path, i) of paths"
      :key="`path-${i}`"
      fill-rule="evenodd"
      clip-rule="evenodd"
      :opacity="path.opacity"
      :d="path.d"
    />
  </svg>
</template>

<script>
import { computed } from 'vue'
import icons from '@/assets/icons.json'

export default {
  props: {
    name: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '',
    },
  },

  setup(props) {
    const paths = computed(() => {
      const icon = icons[props.name]

      if (Array.isArray(icon)) {
        return icon
      } else if (typeof icon === 'string') {
        return [{ opacity: 1, d: icon }]
      } else {
        return [{ opacity: 1, d: icons.default }]
      }
    })

    return { paths }
  },
}
</script>

<style lang="postcss" scoped>
.icon {
  will-change: fill;
  transition: fill 0.1s linear;
}
</style>
