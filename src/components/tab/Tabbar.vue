<template>
  <div class="Tabbar">
    <h1>Drosse</h1>
    <Tab/>
    <Add class="add"/>
  </div>
</template>

<script>
import Tab from '@/components/tab/Tab'
import Add from '@/components/button/Add'

export default {
  name: 'Tabbar',
  components: { Tab, Add }
}
</script>

<style lang="postcss" scoped>
.Tabbar {
  display: flex;
  align-items: center;
  padding-top: .5rem;
}

h1 {
  margin: 0 1rem .125rem 5rem;
  padding: 0;
  font-family: Oswald, sans-serif;
  font-weight: 500;
  font-size: 1.2rem;
  text-transform: uppercase;
  color: var(--c-gray-inactive);
}

.add {
  margin: 0 1rem .25rem .5rem;
  width: 1.125rem;
  height: 1.125rem;
}

/* Colors */
.Tabbar {
  background-color: var(--c-tabbar-bg);
}
</style>