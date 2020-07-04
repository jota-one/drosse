<template>
  <span
    :class="['Input', { focus }]"
    :style="{ width: `${width}px` }"
  >
    <input
      type="text"
      :value="v"
      @input="onInput"
      @focus="focus = true"
      @blur="focus = false"
    >
    <span ref="mask" class="mask">{{ v }}</span>
  </span>
</template>

<script>
export default {
  name: 'Input',

  props: {
    value: {
      type: String,
      default: ''
    }
  },

  data: () => ({
    v: '',
    width: 0,
    focus: false
  }),

  watch: {
    value: {
      immediate: true,
      handler () {
        this.v = this.value
        this.resize()
      }
    }
  },

  methods: {
    onInput (event) {
      this.v = event.target.value
      this.resize()
    },

    resize () {
      this.$nextTick(() => {
        const width = this.$refs.mask.offsetWidth
        this.width = width + 2
      })
    }
  }
}
</script>

<style lang="postcss" scoped>
.Input {
  position: relative;
  padding: .25rem;
  border: 1px solid transparent;
  border-radius: .25rem;

  &:hover,
  &.focus {
    border-color: var(--c-gray-inactive);
  }
}

input {
  width: 100%;
  padding: 0;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
  border: none;
  background-color: transparent;
  outline: none;
}

.mask {
  position: absolute;
  top: 0;
  left: 0;
  visibility: hidden;
  white-space: nowrap;
}
</style>