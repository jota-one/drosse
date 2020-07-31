<template>
  <div class="TabBar">
    <div class="container">
      <h1>
        <button class="drosse">Drosse</button>
      </h1>
      <Tab />
      <Clickable icon="plus" class="add" />
    </div>
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
.container {
  display: flex;
  align-items: center;
  padding-top: .5rem;
}

h1 {
  margin: -.35rem 0 0 0;
}

.drosse {
  margin: 0 1rem 0 5rem;
  padding: .25rem;
  font-family: Oswald, sans-serif;
  font-weight: 500;
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
  will-change: background-color;
  transition: background-color .2s ease-in-out;
}

.drosse {
  color: rgb(128,128,128);
  will-change: color;
  transition: color .2s ease-in-out;
}

.add {
  fill: var(--c-gray-inactive);
  will-change: fill;
  transition: fill .2s ease-in-out;
}
</style>