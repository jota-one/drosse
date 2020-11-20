<template>
  <fieldset class="Switch">
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
        :class="['toggle', { selected: selected === value.value }]"
      />
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
  </fieldset>
</template>

<script>
import { ref, watch } from 'vue'
import Icon from '@/components/common/Icon'

export default {
  name: 'Switch',
  components: { Icon },
  props: {
    name: {
      type: String,
      default: 'switch',
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
  setup(props, { emit }) {
    const selected = ref(props.values[0].value)

    watch(
      () => selected.value,
      selected => {
        emit('switched', selected)
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
}

label {
  flex: 1;
  display: flex;
  align-items: center;
  height: 2rem;

  &:first-of-type {
    justify-content: flex-end;
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
  width: 1.75rem;
  height: 1.75rem;
}

.toggle {
  position: absolute;
  width: 1em;
  height: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
  z-index: 1;
  transform: translate3d(1.175rem, 0, 0);
  transition: transform 0.1s ease-out;

  &.selected {
    transform: translate3d(-0.15rem, 0, 0);
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
