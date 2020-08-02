<template>
  <header :class="['TabBar', { viewHome }]">
    <div class="container">
      <div class="scrollbar">
        <h1>
          <button class="drosse" @click="openHome">Drosse UI</button>
        </h1>
        <Tab
          v-for="drosse in openedDrosses"
          :key="drosse.uuid"
          :name="drosse.name"
          :uuid="drosse.uuid"
          :available="drosse.available"
          :up="drosse.up"
          :selected="drosse.selected"
          @select="openDrosse(drosse.uuid)"
          @close="closeDrosse(drosse.uuid)"
        />
        <Clickable icon="plus" class="add" />
      </div>
    </div>
  </header>
</template>

<script>
import { computed } from 'vue'
import useDrosses from '@/modules/drosses'
import Tab from './Tab'
import Clickable from '@/components/common/Clickable'

export default {
  name: 'TabBar',
  components: { Tab, Clickable },
  async setup () {
    const {
      drosses,
      loadDrosses,
      openDrosse,
      closeDrosse,
      openHome,
      viewHome
    } = useDrosses()

    await loadDrosses()

    const openedDrosses = computed(() => Object.values(drosses.value)
      .filter(drosse => drosse.open))

    return { openedDrosses, openDrosse, closeDrosse, openHome, viewHome }
  }
}
</script>

<style lang="postcss" scoped>
.TabBar {
  height: 3rem;
  overflow: hidden;
}

.scrollbar {
  display: flex;
  align-items: center;
  height: 3rem;
  margin: .65rem 3rem 0 5rem;
  padding: .5rem 0 1rem;
  overflow: auto;
}

h1 {
  margin: -.35rem 0 0 0;
}

.drosse {
  margin: 0 1rem 0 0;
  padding: .25rem;
  font-family: Oswald, sans-serif;
  font-weight: 500;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0;
  white-space: nowrap;
}

.add {
  flex-shrink: 0;
  margin: 0 1rem .25rem .5rem;
  width: 1.125rem;
  height: 1.125rem;
}

/* Colors */
.TabBar {
  background-color: var(--c-tabbar-bg);
  will-change: background-color;
  transition: background-color .2s ease-in-out;
}

.drosse {
  color: rgb(128,128,128);
  will-change: color;
  transition: color .2s ease-in-out;

  .viewHome & {
    color: var(--c-green);
  }
}

.add {
  fill: var(--c-gray-inactive);
  will-change: fill;
  transition: fill .2s ease-in-out;
}
</style>