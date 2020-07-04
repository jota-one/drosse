<template>
  <svg
    class="icon"
    viewBox="0 0 25 25"
    :style="color ? `fill:${color}`: ''"
  >
    <path
      fill-rule="evenodd"
      :d="d"
    />
  </svg>
</template>

<script>
import icons from '@/assets/icons.json'

export default {
  props: {
    name: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: ''
    }
  },

  computed: {
    d () {
      return icons[this.name] || icons.default
    }
  }
}
</script>
