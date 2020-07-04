<template>
  <div class="Route">
    <Clickable class="collapse" icon="chevron" />
    <Input class="path" value="/api" />
    <div class="verbs">
      <Verb type="get" selected />
      <Verb type="post" />
      <Clickable class="remove" icon="minus" />
      <Clickable class="add" icon="plus" />
    </div>
    <Icon class="to" name="route" />
  </div>
</template>

<script>
import Clickable from '@/components/common/Clickable'
import Input from '@/components/common/Input'
import Icon from '@/components/common/Icon'
import Verb from './Verb'

export default {
  name: 'Route',
  components: { Clickable, Input, Icon, Verb }
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
  display: flex;
  align-items: center;
}

.add,
.remove {
  width: 1rem;
  height: 1rem;
}

.to {
  height: 2rem;
  width: 2rem;
  margin-left: 3rem;
}

/* Colors */
.Route {
  color: var(--c-white);
}

.collapse {
  fill: var(--c-gray-active);
}

.add {
  fill: var(--c-gray-active);
}

.remove {
  fill: var(--c-green);
}

.to {
  fill: var(--c-gray-inactive);
}
</style>