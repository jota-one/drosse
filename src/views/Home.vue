<template>
  <div class="Home">
    <div class="header">
      <h2>Your <em>drosses</em></h2>
      <Button
        v-if="allDrosses.length"
        class="btn"
        label="New"
      />
      <Button
        v-if="allDrosses.length"
        class="btn"
        label="Import"
      />
    </div>
    <Drosses v-if="allDrosses.length">
      <Drosse
        v-for="drosse in allDrosses"
        :key="drosse.uuid"
        :drosse="drosse"
      />
    </Drosses>
    <div class="empty" v-else>
      <p class="not-found">
        No drosse found...
      </p>
      <p class="actions">
        <Button class="btn" label="New"/>
        <Button class="btn" label="Import"/>
      </p>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import useDrosses from '@/modules/drosses'
import Button from '@/components/common/Button'
import Drosses from '@/components/drosse/Drosses'
import Drosse from '@/components/drosse/Drosse'

export default {
  name: 'Home',
  components: { Button, Drosses, Drosse },
  setup () {
    const { drosses } = useDrosses()
    const allDrosses = computed(() => Object.values(drosses.value))
    return { allDrosses }
  }
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