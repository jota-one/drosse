<template>
  <div class="FilterBar">
    <div class="col">
      <div class="inner">
        <!-- <Clickable :class="['icon']" icon="collapse-all" />
        <Clickable :class="['icon', 'icon-open-all']" icon="collapse-all" /> -->
        <Clickable
          :class="['icon', { on: showVirtual }]"
          icon="view-tree"
          @click="$emit('toggle-virtual')"
        />
        <Clickable
          :class="['icon', { on: !showVirtual }]"
          icon="view-flat"
          @click="$emit('toggle-virtual')"
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
    </div>
    <div class="col" />
    <div class="col" />
    <div class="col" />
    <div class="col" />
    <div class="col" />
    <div class="col" />
    <div class="col" />
  </div>
</template>

<script>
import { ref } from 'vue'
import Icon from '@/components/common/Icon'
import Clickable from '@/components/common/Clickable'

export default {
  name: 'FilterBar',
  components: { Clickable, Icon },
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

    return { onInput, searchValue }
  },
}
</script>

<style lang="postcss" scoped>
.FilterBar {
  display: table-row;
}

.col {
  display: table-cell;
  height: 3.25rem;
  vertical-align: middle;
}

.inner {
  display: flex;
  algn-items: center;
  padding: 0 0.5rem;
}

.icon {
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
    left: 0.5rem;
    top: 0.4rem;
    width: 1.25rem;
    height: 1.25rem;
    fill: rgba(128, 128, 128, 1);
  }

  .search-input {
    width: 13rem;
    margin-top: 0.125rem;
    padding: 0.35rem 0.35rem 0.35rem 2rem;
    font-family: FiraCode, monospace;
    color: var(--c-green);
    background-color: rgba(128, 128, 128, 0.125);
    border: none;
    border-radius: 0.75rem;

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
