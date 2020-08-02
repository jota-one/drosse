<template>
  <div class="Drosses">
    <div class="container">
      <div class="header">
        <div class="col">
          <label class="label">
            <Clickable class="sort" icon="sort-up"/>
            status
          </label>
        </div>
        <div class="col">
          <label class="label">
            <Clickable class="sort" icon="sort-up"/>
            port
          </label>
        </div>
        <div class="col">
          <label class="label">
            <Clickable class="sort" icon="sort-up"/>
            name
          </label>
        </div>
        <div class="col root">
          <label class="label">
            <Clickable class="sort" icon="sort-up"/>
            root
          </label>
        </div>
        <div class="col">
          <label class="label">
            <Clickable class="sort" icon="sort-up"/>
            protocol
          </label>
        </div>
        <div class="col">
          <label class="label">
            <Clickable class="sort" icon="sort-up"/>
            last seen
          </label>
        </div>
        <div class="col">delete</div>
      </div>
      <slot/>
    </div>
  </div>
</template>

<script>
import Clickable from '@/components/common/Clickable'

export default {
  name: 'Drosses',
  components: { Clickable }
}
</script>

<style lang="postcss" scoped>
.Drosses {
  overflow: auto;
  width: 100%;
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
  padding: 1rem 1rem 1rem.5rem;
  vertical-align: middle;
  white-space: nowrap;
  font-size: .9rem;

  &.root {
    width: 100%;
  }
}

.label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.sort {
  margin-right: .25rem;
  width: 1.5rem;
  height: 1.5rem;
}

/* Colors */
.header {
  background-color: rgba(128,128,128, .1);
}

.sort {
  fill: var(--c-gray-active);
}
</style>