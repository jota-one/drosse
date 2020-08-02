<template>
  <div :class="['Detail', { unavailable: !drosse.available }]">
    <h2><Input :value="drosse.name" /></h2>
    <section class="config">
      <DrosseIcon big :up="drosse.up" :available="drosse.available" />
      <div class="port">
        :<Input class="input" :value="drosse.port" />
      </div>
      <Input class="root" :value="drosse.root" />
      <!-- <input placeholder="Search in routes" value="" /> -->
    </section>
    <Routes>
      <Route
        v-for="route in routes"
        :key="route.path"
        :route="route"
      />
    </Routes>
  </div>
</template>

<script>
import { computed } from 'vue'
import useDrosses from '@/modules/drosses'
import useRoutes from '@/modules/routes'
import DrosseIcon from '@/components/common/DrosseIcon'
import Input from '@/components/common/Input'
import Routes from '@/components/route/Routes'
import Route from '@/components/route/Route'

export default {
  name: 'Detail',
  components: { DrosseIcon, Input, Routes, Route },
  setup () {
    const { drosses } = useDrosses()
    const { getRoutes } = useRoutes()

    const drosse = computed(() => Object.values(drosses.value)
      .find(drosse => drosse.selected))

    const routes = getRoutes(drosse)

    return { drosse, routes }
  }
}
</script>

<style lang="postcss" scoped>
h2 {
  display: inline-flex;
  margin: 0;
  padding: 0;
  font-size: 1.2rem;
  font-weight: 400;
}

.config {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  border-bottom: 1px dashed;
}

.port {
  display: flex;
  align-items: center;
  margin-right: 1rem;

  .input {
    margin-left: -.25rem;
  }
}

.root {
  font-size: .9rem;
}

/* Colors */
.port {
  color: var(--c-green);

  .unavailable & {
    color: var(--c-red);
  }
}

.config {
  border-bottom-color: var(--c-gray-inactive);
}
</style>