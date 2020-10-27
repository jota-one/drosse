<template>
  <div class="FileBrowser">
    <div class="wrapper">
      <button v-if="path !== root" class="parent" @click="openParent">
        ..
      </button>
      <button
        v-for="dir in dirs"
        :key="dir.path"
        :class="['dir', { selectable: dir.selectable }]"
        @click="open(dir)"
      >
        {{ dir.path }}
      </button>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import useIo from '@/modules/io'

export default {
  name: 'FileBrowser',
  props: {
    root: {
      type: String,
      default: '/',
    },
  },
  setup(props) {
    const { browse } = useIo()
    const dirs = ref([])
    const path = ref(props.root)

    const open = async dir => {
      if (dir.selectable) {
        confirm(`Import ${dir.path}?`)
        return
      }

      dirs.value = await browse(dir.path)
      path.value = dir.path
    }

    const openParent = async () => {
      const parent =
        path.value.split('/').reverse().slice(1).reverse().join('/') ||
        props.root

      dirs.value = await browse(parent)
      path.value = parent
    }

    onMounted(async () => {
      dirs.value = await browse(props.root)
    })

    return { dirs, open, openParent, path }
  },
}
</script>

<style lang="postcss" scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1rem;
  width: 100%;
  height: 100%;
}

.parent,
.dir {
  padding: 0.125rem 0 0.25rem;
}

.dir {
  &.selectable {
    font-weight: 500;
    cursor: pointer;
  }
}

/* Colors */
.FileBrowser {
  .light & {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .dark & {
    background-color: rgba(0, 0, 0, 0.25);
  }
}

.parent,
.dir {
  color: var(--c-white);
}

.dir.selectable {
  color: var(--c-green);
}
</style>
