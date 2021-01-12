<template>
  <div :class="['Drosse', { up: drosse.up, unavailable: !drosse.available }]">
    <div class="col">
      <DrosseIcon
        :up="drosse.up"
        :available="drosse.available"
        :uuid="drosse.uuid"
      />
    </div>
    <div class="col port">{{ drosse.port }}</div>
    <div class="col">
      <button class="name" @click="openDrosse(drosse.uuid)">
        {{ drosse.name }}
      </button>
    </div>
    <div class="col root">{{ drosse.root }}</div>
    <div class="col">{{ drosse.proto }}</div>
    <div class="col last-seen">{{ lastSeen }}</div>
    <div class="col delete">
      <Clickable
        v-if="!drosse.up"
        class="delete-icon"
        icon="minus"
        @click="removeDrosse(drosse.uuid)"
      />
    </div>
  </div>
</template>

<script>
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict/index'
import { computed } from 'vue'
import useDrosses from '@/modules/drosses'
import useIo from '@/modules/io'
import DrosseIcon from '@/components/common/DrosseIcon'
import Clickable from '@/components/common/Clickable'

export default {
  name: 'Drosse',
  components: { DrosseIcon, Clickable },
  props: {
    drosse: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const { drosses, openDrosse } = useDrosses()
    const { saveDrosses } = useIo()
    const lastSeen = computed(() =>
      formatDistanceToNowStrict(new Date(props.drosse.lastSeen))
    )

    const removeDrosse = uuid => {
      delete drosses.value[uuid]
      saveDrosses(drosses.value)
    }

    return { lastSeen, openDrosse, removeDrosse }
  },
}
</script>

<style lang="postcss" scoped>
.Drosse {
  display: table-row;

  &.unavailable {
    background-size: 1rem 1rem;
    background-position: 0 0;
  }
}

.col {
  display: table-cell;
  vertical-align: middle;
  white-space: nowrap;
  padding: 0.75rem 0.5rem 0.75rem 1.25rem;
  border-bottom: 1px solid;

  &.port,
  &.root {
    font-weight: 400;
  }

  &.root {
    font-size: 0.8rem;
  }

  &.delete {
    margin-left: 1rem;
  }
}

.name {
  padding: 0.5rem;
  font-size: 1rem;
}

.delete-icon {
  width: 1.5rem;
  width: 1.5rem;
}

/* Colors */
.Drosse {
  &.up {
    color: var(--c-white);

    .port {
      color: var(--c-green);
    }
  }

  &.unavailable {
    background-image: var(--c-unavailable-bg);

    .port {
      color: var(--c-red);
    }
  }
}

.col {
  border-bottom-color: rgba(128, 128, 128, 0.2);
}

.name {
  color: inherit;
}

.delete-icon {
  fill: var(--c-green);
}
</style>
