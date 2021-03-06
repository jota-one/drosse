<template>
  <div :class="['Plugin', { active, inherited }]">
    <div class="icon-wrapper" :title="title" :tool-tip="tooltip">
      <Clickable :class="['icon', { active }]" :icon="icon" @click="onClick" />
    </div>
    <div v-if="active" class="handler">
      <slot />
    </div>
  </div>
</template>

<script>
import Clickable from '@/components/common/Clickable'

export default {
  name: 'Plugin',
  components: { Clickable },
  props: {
    active: Boolean,
    icon: {
      type: String,
      default: '',
    },
    inherited: Boolean,
    title: {
      type: String,
      default: '',
    },
    tooltip: {
      type: String,
      default: '',
    },
  },
  setup() {
    const onClick = type => {
      alert(`Edit mode not yet implemented...`)
    }

    return { onClick }
  },
}
</script>

<style lang="postcss" scoped>
.Plugin {
  height: inherit;
  display: flex;
  align-items: center;
  max-width: 12rem;

  &:before {
    content: '';
    height: 1.5rem;
    opacity: 0.75;
  }
}

.icon-wrapper {
  position: relative;
  flex-shrink: 0;

  .active & {
    &:after {
      content: attr(tool-tip);
      position: absolute;
      bottom: 0.25rem;
      right: 100%;
      display: block;
      visibility: hidden;
      padding: 0.5rem 0.75rem;
      white-space: nowrap;
      font-size: 0.8rem;
      text-align: center;
      opacity: 0;
      border-radius: 0.35rem;
      z-index: 999;
      transition: opacity 0.1s ease-in-out;
    }

    &:hover:after {
      visibility: visible;
      opacity: 1;
    }
  }
}

.icon {
  width: 2rem;
  height: 2rem;
}

.handler {
  display: flex;
  align-items: center;
  margin-top: 0.125rem;
  display: none;
}

/* Colors */
.Plugin {
  color: var(--c-gray-inactive);

  &.active {
    color: var(--c-white);
  }
}

.icon-wrapper:after {
  color: var(--c-white);

  .light & {
    background-color: rgba(200, 200, 200, 0.9);
  }

  .dark & {
    background-color: rgba(0, 0, 0, 0.9);
  }
}

.icon {
  fill: var(--c-gray-inactive);
  opacity: 0.5;

  .active & {
    opacity: 1;
  }

  .inherited & {
    .light & {
      opacity: 0.5;
    }

    .dark & {
      opacity: 0.35;
    }
  }
}
</style>
