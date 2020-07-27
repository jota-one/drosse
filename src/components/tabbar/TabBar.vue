<template>
  <div class="TabBar">
    <h1>Drosse</h1>
    <Tab />
    <Clickable icon="plus" class="add" />
  </div>
</template>

<script>
import Tab from './Tab'
import Clickable from '@/components/common/Clickable'

export default {
  name: 'TabBar',
  components: { Tab, Clickable }
}
</script>

<style lang="postcss" scoped>
.TabBar {
  display: flex;
  align-items: center;
  padding-top: .5rem;
}

h1 {
  margin: 0 1rem .125rem 5rem;
  padding: 0;
  font-family: Oswald, sans-serif;
  font-weight: 400;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0;
}

.add {
  margin: 0 1rem .25rem .5rem;
  width: 1.125rem;
  height: 1.125rem;
}

/* Colors */
.TabBar {
  background-color: var(--c-tabbar-bg);
}

h1 {
  color: var(--c-gray-inactive);
}

.add {
  fill: var(--c-gray-inactive);
}
</style>