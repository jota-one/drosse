<template>
  <span
    :class="['Input', { focus: state.focus }]"
    :style="{ width: `calc(${state.width}px + .75rem)` }"
  >
    <input
      type="text"
      :value="state.v"
      @input="onInput"
      @focus="state.focus = true"
      @blur="state.focus = false"
    >
    <pre ref="mask" class="mask">{{ state.vMask }}</pre>
  </span>
</template>

<script>
import { ref, reactive, watchEffect, nextTick } from 'vue'

export default {
  name: 'Input',
  props: {
    value: String
  },
  setup (props) {
    const state = reactive({
      v: '',
      vMask: '',
      width: 0,
      focus: false
    })

    const mask = ref(null)

    const updateValue = value => {
      state.v = value
      state.vMask = value.replace(/\s/g, '_')
    }

    const onInput = event => {
      updateValue(event.target.value)
      resize()
    }

    const resize = () => {
      nextTick(() => {
        state.width = mask.value.offsetWidth + 3
      })
    }

    watchEffect(() => {
      updateValue(props.value)
      resize()
    })

    return { state, onInput, mask }
  }
}
</script>

<style lang="postcss" scoped>
.Input {
  position: relative;
  padding: .35rem .25rem .25rem;
  border: 1px solid transparent;
  border-radius: .25rem;

  &:hover,
  &.focus {
    border-color: var(--c-gray-inactive);
    background-color: rgba(0,0,0, .1);
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
  font-family: inherit;
  top: 0;
  left: 0;
  visibility: hidden;
  white-space: nowrap;
  user-select: none;
}
</style>