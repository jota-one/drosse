<template>
  <tr class="FilterBar">
    <td colspan="2" class="col">
      <div class="rows-wrapper">
        <div class="inner">
          <div class="counter">
            <div class="badge">
              {{ routes.filter(route => !route.virtual).length }}
            </div>
          </div>
          <div class="search">
            <div class="search-wrapper">
              <Icon name="filter" class="search-icon" />
              <input
                v-model="filters.search"
                type="text"
                class="search-input"
                placeholder="Filter routes"
                @input="onSearch"
              />
            </div>
          </div>
          <div class="verbs">
            <Verb
              v-for="verb in verbs"
              :key="verb"
              :type="verb"
              :selected="filters.verbs.includes(verb)"
              @click="onVerbToggle(verb)"
            />
          </div>
        </div>
        <div class="outer">
          <div class="toggle-routes">
            <Clickable
              :disabled="!showVirtual"
              :class="[
                'button',
                { opened: toggleRoutes.opened, closed: toggleRoutes.closed },
              ]"
              icon="close-all"
              @click="onRoutesToggle"
            />
          </div>
          <Switch
            class="switch-virtual-routes"
            :values="[
              { icon: 'view-tree', value: true },
              { icon: 'view-flat', value: false },
            ]"
            :selected-index="showVirtual ? 0 : 1"
            @switched="$emit('toggle-virtual')"
          />
        </div>
      </div>
    </td>
    <td colspan="4" class="col handler">
      <div class="inner">
        <div class="handlers">
          <Clickable
            :class="['icon', 'proxy']"
            icon="proxy"
            title="Proxy route"
          />
          <Clickable
            :class="['icon']"
            icon="file-js"
            title="Handle response in JS file"
          />
          <Clickable
            :class="['icon']"
            icon="file-json"
            title="Handle response in JSON file"
          />
          <Clickable :class="['icon']" icon="json" title="Route response" />
        </div>
      </div>
    </td>
  </tr>
</template>

<script>
import { computed, reactive } from 'vue'
import Icon from '@/components/common/Icon'
import Clickable from '@/components/common/Clickable'
import Switch from '@/components/common/Switch'
import Verb from '@/components/route/Verb'

export default {
  name: 'FilterBar',
  components: { Icon, Clickable, Switch, Verb },
  props: {
    showVirtual: Boolean,
    routes: {
      type: Array,
      default: () => [],
    },
  },
  setup(props, { emit }) {
    const filters = reactive({
      search: '',
      verbs: [],
      handlers: [],
    })
    const toggleRoutes = computed(() => {
      const routes = props.routes.filter(route => route.isParent)

      return {
        opened: routes.every(route => route.opened),
        closed: routes.every(route => !route.opened),
      }
    })
    const verbs = computed(() =>
      props.routes.reduce((verbs, route) => {
        for (const verb of (route.verbs || []).map(verb => verb.type)) {
          if (!verbs.includes(verb)) {
            verbs.push(verb)
          }
        }
        return verbs
      }, [])
    )

    const onRoutesToggle = () => {
      const state = toggleRoutes.value.opened ? 'closed' : 'opened'
      emit('toggle-routes', state)
    }

    const onSearch = value => {
      setTimeout(() => {
        emit('filter', filters)
      })
    }

    const onVerbToggle = verb => {
      if (filters.verbs.includes(verb)) {
        filters.verbs = filters.verbs.filter(v => v !== verb)
      } else {
        filters.verbs.push(verb)
      }
      setTimeout(() => {
        emit('filter', filters)
      })
    }

    return {
      filters,
      onRoutesToggle,
      onSearch,
      onVerbToggle,
      toggleRoutes,
      verbs,
    }
  },
}
</script>

<style lang="postcss" scoped>
td {
  vertical-align: top;
}

.inner {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
}

.outer {
  display: flex;
  align-items: center;
  padding: 0.25rem 0;
}

.icon {
  position: relative;
  width: 2rem;
  height: 2rem;
}

.toggle-routes,
.switch-virtual-routes {
  margin-left: 1rem;
}

.toggle-routes {
  .button {
    width: 1.5rem;
    height: 1.5rem;
    transform: rotate(45deg);
    transition: transform 0.1s linear;

    &.closed {
      transform: rotate(0deg);
    }

    &.opened {
      transform: rotate(90deg);
    }

    &[disabled] {
      opacity: 0.3;
      cursor: default;
    }
  }
}

.icon-open-all {
  transform: rotate(90deg);
}

.counter {
  margin-left: 1rem;

  .badge {
    display: flex;
    align-items: center;
    justidy-content: center;
    padding: 0.35rem 0.55rem 0.35rem 0.525rem;
    font-size: 0.7rem;
    font-weight: 500;
    color: var(--c-gray-active);
    border-radius: 1.25rem;
    background-color: rgba(0, 0, 0, 0.3);
  }
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  margin: 0.25rem 0.5rem 0.25rem 1rem;

  .search-icon {
    position: absolute;
    left: 0.65rem;
    top: calc(50% - 0.575rem);
    width: 1.25rem;
    height: 1.25rem;
  }

  .search-input {
    width: 12rem;
    padding: 0.35rem 0.5rem 0.35rem 2.25rem;
    font-family: FiraCode, monospace;
    border: none;
    border-radius: 1rem;

    &:focus {
      outline: none;
    }
  }
}

.verbs {
  display: flex;
  align-items: center;
  margin: 0 0.5rem;
}

/* Colors */
.FilterBar {
  background-color: rgba(0, 0, 0, 0.035);
}

.inner {
  background-color: rgba(0, 0, 0, 0.075);
}

.icon {
  fill: var(--c-gray-inactive);

  &:hover,
  &.on {
    fill: var(--c-green);
  }
}

.toggle-routes {
  .button {
    fill: var(--c-gray-inactive);

    &.closed {
      fill: var(--c-green);
    }

    &.opened {
      fill: var(--c-green);
    }
  }
}

.search {
  .search-icon {
    fill: rgba(128, 128, 128, 1);
  }

  .search-input {
    color: var(--c-green);
    background-color: rgba(128, 128, 128, 0.125);
  }
}
</style>
