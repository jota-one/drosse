<template>
  <tr class="FilterBar">
    <td class="col" colspan="8">
      <div class="inner">
        <Switch
          :values="[
            { icon: 'view-flat', value: false },
            { icon: 'view-tree', value: true },
          ]"
          :selected-index="showVirtual ? 1 : 0"
          @switched="$emit('toggle-virtual')"
        />
        <Switch
          :disabled="!showVirtual"
          :selected-index="toggleRoutesSwitchIndex"
          :values="[
            { icon: 'close-all', value: 'closed' },
            { label: '', value: '' },
            { icon: 'open-all', value: 'opened' },
          ]"
          @switched="$emit('toggle-routes', $event)"
        />
        <div class="search">
          <Icon name="search" class="search-icon" />
          <input
            v-model="searchValue"
            type="text"
            class="search-input"
            placeholder="Filter routes"
            @input="onInput"
          />
        </div>
      </div>
    </td>
  </tr>
</template>

<script>
import { ref, computed } from 'vue'
import Icon from '@/components/common/Icon'
import Switch from '@/components/common/Switch'

export default {
  name: 'FilterBar',
  components: { Icon, Switch },
  props: {
    showVirtual: Boolean,
    routes: {
      type: Array,
      default: () => [],
    },
  },
  setup(props, { emit }) {
    const searchValue = ref('')
    const toggleRoutesSwitchIndex = computed(() => {
      const routes = props.routes.filter(route => route.isParent)
      const index = routes.every(route => route.opened)
        ? 2
        : routes.every(route => !route.opened)
        ? 0
        : 1
      return index
    })

    const onInput = value => {
      setTimeout(() => {
        emit('search', searchValue.value)
      })
    }

    const onViewModeChanged = viewMode => {
      console.log('onViewModeChanged', viewMode)
    }

    return {
      onInput,
      onViewModeChanged,
      searchValue,
      toggleRoutesSwitchIndex,
    }
  },
}
</script>

<style lang="postcss" scoped>
.inner {
  display: flex;
  algn-items: center;
  padding: 0.75rem 0;

  & > * {
    margin: 0;
    padding: 0 1rem;

    &:not(:last-child) {
      border-right: 1px dashed rgba(128, 128, 128, 0.25);
    }
  }
}

.icon {
  position: relative;
  width: 2rem;
  height: 2rem;
}

.icon-open-all {
  transform: rotate(90deg);
}

.search {
  position: relative;
  display: flex;
  align-items: center;

  .search-icon {
    position: absolute;
    left: 1rem;
    top: calc(50% - 0.6rem);
    width: 1.25rem;
    height: 1.25rem;
    fill: rgba(128, 128, 128, 1);
  }

  .search-input {
    width: 20rem;
    padding: 0.5rem 0.5rem 0.5rem 2.25rem;
    font-family: FiraCode, monospace;
    color: var(--c-green);
    background-color: rgba(128, 128, 128, 0.125);
    border: none;
    border-radius: 1rem;

    &:focus {
      outline: none;
    }
  }
}

/* Colors */
.col {
  background-color: rgba(0, 0, 0, 0.075);
}

.icon {
  fill: var(--c-gray-inactive);

  &:hover,
  &.on {
    fill: var(--c-green);
  }
}
</style>
