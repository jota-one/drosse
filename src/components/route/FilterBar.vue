<template>
  <tr class="FilterBar">
    <td class="col" colspan="8">
      <div class="inner">
        <Clickable
          :class="['icon']"
          icon="collapse-all"
          title="Collapse all routes"
          @click="$emit('collapse-all-routes')"
        />
        <Switch
          :values="[
            { icon: 'view-tree', value: 1 },
            { icon: 'view-flat', value: 0 },
          ]"
          @switched="$emit('toggle-virtual')"
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
import { ref } from 'vue'
import Icon from '@/components/common/Icon'
import Clickable from '@/components/common/Clickable'
import Switch from '@/components/common/Switch'

export default {
  name: 'FilterBar',
  components: { Clickable, Icon, Switch },
  props: {
    showVirtual: Boolean,
  },
  setup(props, { emit }) {
    const searchValue = ref('')

    const onInput = value => {
      setTimeout(() => {
        emit('search', searchValue.value)
      })
    }

    const onViewModeChanged = viewMode => {
      console.log('onViewModeChanged', viewMode)
    }

    return { onInput, onViewModeChanged, searchValue }
  },
}
</script>

<style lang="postcss" scoped>
.inner {
  display: flex;
  algn-items: center;
  padding: 0.75rem 0;

  & > * {
    margin: 0 0.75rem 0 0.5rem;
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
  margin: 0 1rem;

  .search-icon {
    position: absolute;
    left: 0.65rem;
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
