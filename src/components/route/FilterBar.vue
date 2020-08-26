<template>
  <div class="FilterBar">
    <div class="col">
      <div class="inner">
        <Clickable
          :class="['flatten-icon', { flatten: !showVirtual }]"
          icon="flatten"
          @click="$emit('toggle-virtual')"
        />
      </div>
    </div>
    <div class="col"/>
    <div class="col"/>
    <div class="col"/>
    <div class="col"/>
    <div class="col"/>
    <div class="col"/>
    <div class="col"/>
  </div>
</template>

<script>
import Clickable from '@/components/common/Clickable'

export default {
  name: 'FilterBar',
  components: { Clickable },
  props: {
    showVirtual: Boolean
  }
}
</script>

<style lang="postcss" scoped>
.FilterBar {
  display: table-row;
}

.col {
  display: table-cell;
  height: 3rem;
  vertical-align: middle;
}

.inner {
  display: flex;
  algn-items: center;
  padding: 0 .5rem;
}

.flatten-icon {
  width: 2rem;
  height: 2rem;
}

/* Colors */
.col {
  background-color: rgba(0,0,0, .075);
}

.flatten-icon {
  fill: var(--c-gray-inactive);

  &:hover,
  &.flatten {
    fill: var(--c-green);
  }
}
</style>