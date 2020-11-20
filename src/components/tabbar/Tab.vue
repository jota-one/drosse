<template>
  <div :class="['Tab', { selected, unavailable: !available }]">
    <DrosseIcon small :up="up" :available="available" :uuid="uuid" />
    <button class="name" @click="$emit('select')">
      {{ name }}
    </button>
    <button class="close" @click="$emit('close')">
      <Icon class="icon" name="close" />
    </button>
  </div>
</template>

<script>
import useDrosses from '@/modules/drosses'
import Icon from '@/components/common/Icon'
import DrosseIcon from '@/components/common/DrosseIcon'

export default {
  name: 'Tab',
  components: { Icon, DrosseIcon },
  props: {
    name: {
      type: String,
      default: '',
    },
    uuid: {
      type: String,
      default: '',
    },
    up: Boolean,
    available: Boolean,
    selected: Boolean,
  },
  setup() {
    const { closeDrosse } = useDrosses()
    return { closeDrosse }
  },
}
</script>

<style lang="postcss" scoped>
.Tab {
  display: flex;
  padding: 0 0.5rem;
  margin: 0 0.125rem;
  align-items: center;
  height: 2.5rem;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;

  &.unavailable {
    background-size: 1rem 1rem;
  }
}

.name {
  margin: 0 0.5rem;
  white-space: nowrap;
  user-select: none;
  font-size: 0.75rem;
}

.close .icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Colors */
.Tab {
  color: var(--c-white);
  background-color: var(--c-app-bg);
  will-change: background-color, opacity;
  transition: background-color 0.1s ease-in-out, opacity 0.1s ease-in-out;
  opacity: 0.5;

  &:hover {
    opacity: 0.8;
  }

  &.selected {
    opacity: 1;
  }

  &.unavailable {
    background-image: var(--c-unavailable-bg);
  }
}

.name {
  color: inherit;
}

.close .icon {
  fill: var(--c-gray-inactive);
  will-change: fill;
  transition: fill 0.1s ease-in-out;
}
</style>
