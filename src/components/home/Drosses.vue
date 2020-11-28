<template>
  <div class="Drosses">
    <div class="container">
      <div class="header">
        <div class="col">status</div>
        <div class="col">
          <label class="label">
            <Clickable
              class="sort"
              :icon="getSortIcon('port')"
              @click="onSort('port')"
            />
            port
          </label>
        </div>
        <div class="col">
          <label class="label">
            <Clickable
              class="sort"
              :icon="getSortIcon('name')"
              @click="onSort('name')"
            />
            name
          </label>
        </div>
        <div class="col root">
          <label class="label">
            <Clickable
              class="sort"
              :icon="getSortIcon('root')"
              @click="onSort('root')"
            />
            root
          </label>
        </div>
        <div class="col">protocol</div>
        <div class="col">last seen</div>
        <div class="col">remove</div>
      </div>
      <slot />
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import Clickable from '@/components/common/Clickable'

export default {
  name: 'Drosses',
  components: { Clickable },
  props: {
    sortKey: {
      type: String,
      default: 'port.asc',
    },
  },
  setup(props, { emit }) {
    const getSortIcon = key => {
      let icon = 'sort-'

      if (!props.sortKey.includes(key)) {
        icon += 'none'
      } else if (props.sortKey.includes('asc')) {
        icon += 'up'
      } else {
        icon += 'down'
      }

      return icon
    }

    const onSort = key => {
      if (!props.sortKey.includes(key)) {
        key += '.asc'
      } else {
        key += props.sortKey.includes('desc') ? '.asc' : '.desc'
      }

      emit('sort', key)
    }

    onMounted(() => {
      emit('sort', props.sortKey)
    })

    return { getSortIcon, onSort }
  },
}
</script>

<style lang="postcss" scoped>
.Drosses {
  width: 100%;
  padding-bottom: 1rem;
  overflow: auto;
}

.container {
  display: table;
  width: 100%;
}

.header {
  display: table-row;
}

.col {
  display: table-cell;
  padding: 1rem;
  vertical-align: middle;
  white-space: nowrap;
  font-size: 0.9rem;

  &.root {
    width: 100%;
  }
}

.label {
  display: flex;
  align-items: center;
  margin-left: -0.5rem;
  cursor: pointer;
}

.sort {
  margin-right: 0.25rem;
  width: 1.5rem;
  height: 1.5rem;
}

/* Colors */
.header {
  background-color: rgba(128, 128, 128, 0.1);
}

.sort {
  fill: var(--c-gray-active);
}
</style>
