<template>
  <div :class="['Editor', { opened }]">
    <div v-show="opened" class="container">
      <div class="editor-container">
        <div id="editor" />
      </div>
      <div v-if="opened" class="actions">
        <Button
          secondary
          class="cancel"
          label="cancel"
          @click="$emit('close')"
        />
        <Button
          label="save"
          @click="$emit('close')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watchEffect } from 'vue'
import useEditor from '@/modules/editor'
import useTheme from '@/modules/theme'
import Button from '@/components/common/Button'

export default {
  name: 'Editor',
  components: { Button },
  props: {
    opened: Boolean
  },
  setup () {
    const editor = ref(null)
    const { switchTheme } = useEditor()
    const { theme } = useTheme()

    watchEffect(() => {
      switchTheme(theme.value)
    })

    return { editor, theme }
  }
}
</script>

<style lang="postcss" scoped>
.Editor {
  display: flex;
  z-index: 0;
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
  height: 100%;
  font-size: 1rem;
}

.actions {
  height: 3.5rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.cancel {
  margin-right: 1rem;
}

/* Colors */
#editor {
  background-color: var(--c-tabbar-bg);
  will-change: background-color, border-color;
  transition: background-color .2s ease-in-out, border-color .2s ease-in-out;
}
</style>