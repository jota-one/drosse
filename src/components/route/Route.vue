<template>
  <div class="Route">
    <Clickable class="collapse" icon="chevron" />
    <Input class="path" value="/api" />
    <div class="verbs">
      <Verb type="get" selected />
      <Clickable class="add" icon="plus" />
    </div>
  </div>
</template>

<script>
import Clickable from '@/components/common/Clickable'
import Input from '@/components/common/Input'
import Verb from './Verb'

export default {
  name: 'Route',
  components: { Clickable, Input, Verb }
}
</script>

<style lang="postcss" scoped>
.Route {
  display: flex;
  align-items: center;
  padding: .5rem .75rem .5rem 2.25rem;
}

.collapse {
  width: 1rem;
  height: 1rem;
  margin: 0 .75rem .125rem 0;
}

.path {
  margin-right: .5rem;
}

.verbs {
  margin-bottom: .25rem;
}

/* Colors */
.Route {
  color: var(--c-white);
}

.collapse {
  fill: var(--c-gray-active);
}
</style>