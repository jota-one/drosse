<template>
  <tr class="FilterBar">
    <td class="col" colspan="8">
      <div class="inner">
        <div class="toggle-routes">
          <Clickable
            :class="[
              'button',
              { opened: toggleRoutes.opened, closed: toggleRoutes.closed },
            ]"
            icon="close-all"
            @click="onRoutesToggle"
          />
        </div>
        <Switch
          :values="[
            { icon: 'view-flat', value: false },
            { icon: 'view-tree', value: true },
          ]"
          :selected-index="showVirtual ? 1 : 0"
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
        <div class="verbs">verbs</div>
        <div class="handlers">handlers</div>
        <div class="plugins">plugins</div>
      </div>
    </td>
  </tr>
</template>

<script>
import { computed, ref } from 'vue'
import Icon from '@/components/common/Icon'
import Clickable from '@/components/common/Clickable'
import Switch from '@/components/common/Switch'

export default {
  name: 'FilterBar',
  components: { Icon, Clickable, Switch },
  props: {
    showVirtual: Boolean,
    routes: {
      type: Array,
      default: () => [],
    },
  },
  setup(props, { emit }) {
    const searchValue = ref('')
    const toggleRoutes = computed(() => {
      const routes = props.routes.filter(route => route.isParent)

      return {
        opened: routes.every(route => route.opened),
        closed: routes.every(route => !route.opened),
      }
    })

    const onRoutesToggle = () => {
      const state = toggleRoutes.value.opened ? 'closed' : 'opened'
      console.log('state', state)
      emit('toggle-routes', state)
    }

    const onInput = value => {
      setTimeout(() => {
        emit('search', searchValue.value)
      })
    }

    return {
      onInput,
      onRoutesToggle,
      searchValue,
      toggleRoutes,
    }
  },
}
</script>

<style lang="postcss" scoped>
.col {
  padding-bottom: 1rem;
}

.inner {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;

  & > * {
    margin: 0;
    padding: 0 1rem;
  }
}

.icon {
  position: relative;
  width: 2rem;
  height: 2rem;
}

.toggle-routes {
  .button {
    width: 1.5rem;
    height: 1.5rem;
    transform: rotate(45deg);
    transition: transform 0.1s linear;
    fill: var(--c-gray-inactive);

    &.closed {
      transform: rotate(0deg);
      fill: var(--c-green);
    }

    &.opened {
      transform: rotate(90deg);
      fill: var(--c-green);
    }
  }
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
    left: 1.65rem;
    top: calc(50% - 0.6rem);
    width: 1.25rem;
    height: 1.25rem;
  }

  .search-input {
    width: 13rem;
    padding: 0.5rem 0.5rem 0.5rem 2.25rem;
    font-family: FiraCode, monospace;
    color: var(--c-green);
    border: none;
    border-radius: 1rem;

    &:focus {
      outline: none;
    }
  }
}

/* Colors */
.inner {
  border-bottom: 1px dashed rgba(128, 128, 128, 0.25);
  background-color: rgba(0, 0, 0, 0.075);

  & > *:not(:last-child) {
    border-right: 1px dashed rgba(128, 128, 128, 0.25);
  }
}

.icon {
  fill: var(--c-gray-inactive);

  &:hover,
  &.on {
    fill: var(--c-green);
  }
}

.search {
  .search-icon {
    fill: rgba(128, 128, 128, 1);
  }

  .search-input {
    background-color: rgba(128, 128, 128, 0.125);
  }
}
</style>
