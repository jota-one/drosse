<template>
  <div
    :class="['Editor', { opened, hidden }]"
    :style="{ top: `${top * 2.5}rem` }"
  >
    <div class="container">
      <div class="editor-container">
        <div id="editor" />
      </div>
      <div v-if="opened" class="actions">
        <Button
          secondary
          class="cancel"
          label="Cancel"
          @click="$emit('close')"
        />
        <Button label="Save" @click="$emit('close')" />
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted, ref, watchEffect } from 'vue'
import useEditor from '@/modules/editor'
import useTheme from '@/modules/theme'
import Button from '@/components/common/Button'

export default {
  name: 'Editor',
  components: { Button },
  props: {
    opened: Boolean,
    hidden: Boolean,
    top: {
      type: Number,
      default: 0,
    },
  },
  setup() {
    const initialized = ref(false)
    const { load, switchTheme, unload } = useEditor()
    const { theme } = useTheme()

    onMounted(() => {
      load(document.getElementById('editor'), theme.value)
      initialized.value = true
    })

    onUnmounted(() => {
      unload()
    })

    watchEffect(() => {
      switchTheme(theme.value)
    })

    return { initialized, theme }
  },
}
</script>

<style lang="postcss" scoped>
.Editor {
  position: absolute;
  margin: 12.5rem 0 0.75rem;
  top: 0;
  left: 1rem;
  width: calc(100% - 2rem);
  height: 0;
  display: flex;
  visiblity: visible;
  pointer-events: all;
  will-change: height;
  transition: height 0.2s ease-in-out;

  &.opened {
    height: var(--s-editor-height);
  }

  &.hidden {
    visibility: hidden;
    pointer-events: none;
  }
}

.container {
  flex: 1;
}

.editor-container {
  position: relative;
  height: calc(100% - 3.5rem);
  overflow: hidden;
}

#editor {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: calc(75vh - 4rem);
  font-size: 1rem;
}

.actions {
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.cancel {
  margin-right: 1rem;
}
</style>
