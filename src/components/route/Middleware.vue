<template>
  <div :class="['Middleware', { active }]">
    <Clickable :class="['icon', { active }]" :icon="icon" :title="title" />
    <div v-if="active" class="handler">
      <slot />
    </div>
  </div>
</template>

<script>
import Clickable from '@/components/common/Clickable'

export default {
  name: 'Middleware',
  components: { Clickable },
  props: {
    title: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    active: Boolean,
  },
}
</script>

<style lang="postcss" scoped>
.Middleware {
  height: inherit;
  display: flex;
  align-items: center;
  max-width: 12rem;
  overflow: hidden;

  &:before {
    content: '';
    height: 1.5rem;
    border-left: 1px dashed;
    opacity: 0.75;
  }
}

.icon {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  margin: 0 0.5rem;
}

.handler {
  display: flex;
  align-items: center;
  margin-top: 0.125rem;
  display: none;
}

/* Colors */
.Middleware {
  color: var(--c-gray-inactive);
  &:before {
    color: var(--c-gray-inactive);
  }

  &.active {
    color: var(--c-white);
  }

  .icon {
    fill: var(--c-gray-inactive);
  }
}
</style>
