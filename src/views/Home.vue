<template>
  <div class="Home">
    <div class="header">
      <h2>Your <em>drosses</em></h2>
      <!-- <Button class="btn" label="New" /> -->
      <Button class="btn" label="Import" @click="toggleImport" />
    </div>
    <FileBrowser
      :class="['file-browser', { opened: browserOpened }]"
      root="/"
      @close="browserOpened = false"
      @select="importDrosse"
    />
    <Drosses v-if="allDrosses.length">
      <Drosse
        v-for="drosse in allDrosses"
        :key="drosse.uuid"
        :drosse="drosse"
      />
    </Drosses>
    <div v-else class="empty">
      <p class="not-found">No drosse found...</p>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import useIo from '@/modules/io'
import useDrosses from '@/modules/drosses'
import Button from '@/components/common/Button'
import FileBrowser from '@/components/common/FileBrowser'
import Drosses from '@/components/drosse/Drosses'
import Drosse from '@/components/drosse/Drosse'

export default {
  name: 'Home',
  components: { Button, Drosses, Drosse, FileBrowser },
  setup() {
    const { importFolder } = useIo()
    const { drosses, loadDrosses } = useDrosses()
    const browserOpened = ref(false)
    const allDrosses = computed(() => Object.values(drosses.value))

    const toggleImport = () => {
      browserOpened.value = !browserOpened.value
    }

    const importDrosse = async path => {
      await importFolder(path)
      await loadDrosses()
    }

    return { allDrosses, browserOpened, importDrosse, toggleImport }
  },
}
</script>

<style lang="postcss" scoped>
.header {
  display: flex;
  align-items: center;
  padding: 2rem 0 1.25rem;
  border-bottom: 1px dashed;
}

h2 {
  margin: 0 2rem 0 0;
  font-weight: 200;
  font-size: 1.2rem;
}

em {
  font-family: Oswald, sans-serif;
  font-weight: 500;
  font-size: 1.2rem;
  font-style: normal;
  text-transform: uppercase;
}

.btn {
  margin-right: 1rem;
}

.file-browser {
  height: 0;

  &.opened {
    height: 30vh;
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.actions {
  margin-top: 1.5rem;
}

/* Colors */
.header {
  border-bottom-color: var(--c-gray-inactive);
}
</style>
