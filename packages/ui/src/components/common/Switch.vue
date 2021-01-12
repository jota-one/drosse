<template>
  <div class="Switch" :class="{ disabled }">
    <label v-for="(value, i) in values" :key="value.value">
      <input
        v-model="selected"
        type="radio"
        class="input"
        :name="name"
        :value="value.value"
      />
      <div
        v-if="i === 0"
        :class="[
          'toggle',
          `pos-${values.findIndex(v => v.value === selected)}`,
        ]"
      />
      <div class="marker" />
      <div class="label">
        <template v-if="value.label">
          {{ value.label }}
        </template>
        <Icon
          v-if="value.icon"
          :class="['icon', { selected: selected === value.value }]"
          :name="value.icon"
        />
      </div>
    </label>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import Icon from '@/components/common/Icon'

export default {
  name: 'Switch',
  components: { Icon },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: 'switch',
    },
    selectedIndex: {
      type: Number,
      default: 0,
    },
    values: {
      type: Array,
      default: () => [
        {
          value: true,
          icon: '',
          label: '',
        },
        {
          value: false,
          icon: '',
          label: '',
        },
      ],
    },
  },
  emits: ['switched'],
  setup(props, { emit }) {
    const selected = ref(props.values[props.selectedIndex].value)

    watch(
      () => selected.value,
      selected => {
        emit('switched', selected)
      }
    )

    watch(
      () => props.selectedIndex,
      selectedIndex => {
        selected.value = props.values[selectedIndex].value
      }
    )

    return { selected }
  },
}
</script>

<style lang="postcss" scoped>
.Switch {
  position: relative;
  display: flex;
  align-items: center;
  border: none;
  padding: 0;
  margin: 0;

  &.disabled {
    opacity: 0.35;
    pointer-events: none;
  }
}

label {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  height: 2rem;

  .marker {
    position: absolute;
    top: 0.9rem;
    left: 0.65rem;
    width: 0.2rem;
    height: 0.2rem;
    border-radius: 50%;
    background-color: rgba(128, 128, 128, 0.25);
  }

  &:first-of-type {
    justify-content: flex-end;

    .marker {
      left: auto;
      right: 0.65rem;
    }
  }
}

.input {
  position: absolute;
  appearance: none;
  margin: 0;
  padding: 0;
  height: 1.5rem;
  width: 1.5rem;
  background-color: rgba(0, 0, 0, 0.25);
  overflow: hidden;

  label:first-of-type & {
    border-top-left-radius: 0.85rem;
    border-bottom-left-radius: 0.85rem;
  }

  label:last-of-type & {
    border-top-right-radius: 0.85rem;
    border-bottom-right-radius: 0.85rem;
  }

  &:focus {
    outline: none;
  }
}

.label {
  min-width: 1.25rem;
  white-space: nowrap;

  label:first-of-type & {
    margin-right: 1.75rem;
  }

  label:last-of-type & {
    margin-left: 1.75rem;
  }
}

.icon {
  margin-top: 0.125rem;
  width: 1.5rem;
  height: 1.5rem;
}

.toggle {
  position: absolute;
  width: 1em;
  height: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
  z-index: 1;
  transition: transform 0.1s ease-out;

  &.pos-0 {
    transform: translate3d(-0.25rem, 0, 0);
  }

  &.pos-1 {
    transform: translate3d(1.25rem, 0, 0);
  }

  &.pos-2 {
    transform: translate3d(2.75rem, 0, 0);
  }
}

/* Colors */
.icon {
  fill: var(--c-gray-inactive);

  &.selected {
    fill: var(--c-green);
  }
}

.toggle {
  background-color: var(--c-green);
}
</style>
