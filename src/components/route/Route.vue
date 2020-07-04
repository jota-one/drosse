<template>
  <div class="Route">
    <div class="col">
      <div class="inner">
        <div class="level" :style="{ width: `${(route.level + 1 )}rem` }"/>
        <Clickable class="collapse" icon="chevron" />
        <Input class="path" :value="route.path" />
        <div class="verbs">
          <Verb type="get" selected />
          <Verb type="post" />
          <Clickable class="remove" icon="minus" />
          <Clickable class="add" icon="plus" />
        </div>
      </div>
    </div>
    <div class="col to">
      <div class="inner">
        <Icon class="icon" name="route" />
      </div>
    </div>
    <div class="col handler">
      <div class="inner">
        <Clickable class="icon fail" icon="fail" title="Randomly fail route" />
        <Clickable class="icon proxy" icon="proxy" title="Proxy route" />
        <Clickable class="icon" icon="file" title="Handle response in file" />
        <Clickable class="icon active" icon="json" title="Route response" />
        <Input class="input" :value="JSON.stringify({ some: 'json' })" />
      </div>
    </div>
    <div class="col throttle">
      <div class="inner">
        <Clickable class="icon throttle" icon="throttle" title="Throttle" />
        <Input class="input" value="0" />
      </div>
    </div>
    <div class="col headers">
      <div class="inner">
        <Clickable class="icon" icon="header" title="Headers" />
        <Input class="input" :value="JSON.stringify({})" />
      </div>
    </div>
    <div class="col delete">
      <div class="inner">
        <Clickable class="icon" icon="minus" title="Delete route" />
      </div>
    </div>
  </div>
</template>

<script>
import Clickable from '@/components/common/Clickable'
import Input from '@/components/common/Input'
import Icon from '@/components/common/Icon'
import Verb from './Verb'

export default {
  name: 'Route',
  components: { Clickable, Input, Icon, Verb },
  props: { route: Object }
}
</script>

<style lang="postcss" scoped>
.Route {
  display: table-row;
}

.col {
  display: table-cell;
  vertical-align: top;

  &.full {
    width: 100%;
  }
}

.inner {
  display: flex;
  align-items: center;
  padding: .25rem 0;
}

.collapse {
  width: 1rem;
  height: 1rem;
  margin: 0 .25rem .125rem 0;
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
  margin-right: .25rem;
}

.to {
  .inner {
    justify-content: center;
  }

  .icon {
    height: 2rem;
    width: 2rem;
    margin: 0 3rem;
  }
}

.icon {
  width: 2rem;
  height: 2rem;
}

.input {
  margin: .25rem 0 0 .25rem;
}

.handler {
  width: 100%;

  .input {
    min-width: 10rem;
    font-size: .9rem;
    margin-right: 1rem;
  }
}

.throttle,
.headers {
  .inner {
    position: relative;
  }
}

.delete .icon {
  margin-top: .25rem;
  width: 1.5rem;
  height: 1.5rem;
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

.icon {
  fill: var(--c-gray-inactive);

  &.active {
    fill: var(--c-green);

    &.proxy {
      fill: var(--c-blue);
    }

    &.fail {
      fill: var(--c-red);
    }

    &.throttle {
      fill: var(--c-yellow);
    }
  }
}

.throttle,
.headers {
  color: var(--c-gray-inactive);
}

.delete .icon {
  fill: var(--c-gray-active);
}
</style>