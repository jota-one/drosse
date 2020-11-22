<template>
  <div
    :class="[
      'Route',
      {
        isParent: route.isParent,
        hit,
        virtual: route.virtual,
        opened: route.opened,
        disabled: selectedVerb?.disabled,
      },
    ]"
  >
    <div class="col def">
      <div class="inner">
        <div
          class="level"
          :style="{ width: `${(showVirtual ? route.level : 1) * 0.75}rem` }"
        />
        <Clickable
          v-if="showVirtual && route.isParent"
          class="collapse"
          icon="chevron"
          @click="$emit('toggle-route')"
        />
        <Input
          class="path"
          :value="showVirtual ? route.path : route.fullPath"
        />
        <div class="verbs">
          <Verb
            v-for="verb in route.verbs"
            :key="verb.type"
            :type="verb.type"
            :selected="route.selected === verb.type"
            :disabled="verb.disabled"
            @click="$emit('select-verb', verb.type)"
          />
          <!-- <Clickable
            v-if="!route.virtual && route.verbs.length > 0"
            class="remove"
            icon="minus"
          />
          <Clickable v-if="!route.virtual" class="add" icon="plus" /> -->
        </div>
      </div>
    </div>
    <div class="col to">
      <div v-if="!route.virtual" class="inner">
        <Icon class="icon" name="route" />
      </div>
    </div>
    <Handler
      class="col handler full"
      :route="route"
      :selected-verb="selectedVerb"
      :editing="editing"
      @toggle-editor="$emit('toggle-editor', $event)"
      @open-file="$emit('open-file', $event)"
    />
    <div class="col middleware">
      <div v-if="!route.virtual" class="inner">
        <RouteTemplate :verb="selectedVerb" />
      </div>
    </div>
    <div class="col middleware">
      <div v-if="!route.virtual" class="inner">
        <Throttle :verb="selectedVerb" />
      </div>
    </div>
    <template v-if="false">
      <div class="col middleware">
        <div v-if="!route.virtual" class="inner">
          <Fail :verb="selectedVerb" />
        </div>
      </div>
      <div class="col middleware">
        <div v-if="!route.virtual" class="inner">
          <Headers :verb="selectedVerb" />
        </div>
      </div>
    </template>
    <!-- <div class="col actions">
      <div class="inner">
        <Clickable
          :class="['icon', { disabled: !route.virtual }]"
          icon="plus"
          title="Create route"
        />
        <Clickable
          :class="[
            'icon',
            {
              disabled: route.virtual,
              active: selectedVerb?.disabled,
            },
          ]"
          icon="disable"
          title="Disable route"
        />
        <Clickable
          :class="['icon', { disabled: route.virtual }]"
          icon="minus"
          title="Delete route"
        />
      </div>
    </div> -->
    <div class="col end" />
  </div>
</template>

<script>
import { computed } from 'vue'
import Clickable from '@/components/common/Clickable'
import Input from '@/components/common/Input'
import Icon from '@/components/common/Icon'
import Verb from './Verb'
import RouteTemplate from './RouteTemplate'
import Throttle from './Throttle'
import Fail from './Fail'
import Headers from './Headers'
import Handler from './Handler'

export default {
  name: 'Route',
  components: {
    Clickable,
    Input,
    Icon,
    Verb,
    RouteTemplate,
    Throttle,
    Fail,
    Headers,
    Handler,
  },
  props: {
    route: {
      type: Object,
      default: () => ({}),
    },
    showVirtual: Boolean,
    editing: Boolean,
    hit: Boolean,
  },
  setup(props, { emit }) {
    const selectedVerb = computed(() =>
      props.route.selected === 'global'
        ? props.route.global
        : props.route.verbs?.find(verb => verb.type === props.route.selected)
    )

    return { selectedVerb }
  },
}
</script>

<style lang="postcss" scoped>
.Route {
  display: table-row;
  font-size: 0.9rem;
}

.col {
  display: table-cell;
  vertical-align: top;

  &.full {
    width: 100%;
  }

  &.def {
    padding-left: 1.75rem;
  }
}

.inner,
::v-deep(.inner) {
  display: flex;
  align-items: center;
  padding: 0.25rem 0;
  height: 2.5rem;
}

.collapse {
  visibility: hidden;
  width: 1rem;
  height: 1rem;
  margin: 0 0.25rem 0.125rem 0;
  will-change: transform;
  transition: transform 0.1s ease-in-out;

  .isParent & {
    visibility: visible;
    margin-left: -1.25rem;
  }

  .opened & {
    transform: rotate(90deg);
  }
}

.path {
  margin-right: 0.5rem;
}

.verbs {
  display: flex;
  align-items: center;
}

.add,
.remove {
  width: 1rem;
  height: 1rem;
  margin-right: 0.25rem;
}

.to {
  .inner {
    justify-content: center;
  }

  .icon {
    height: 2rem;
    width: 2rem;
    margin: 0 1rem 0 3rem;
    pointer-events: none;
  }
}

.icon {
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
}

.input {
  margin: 0.25rem 0 0 0.25rem;
  white-space: nowrap;
  overflow: auto hidden;
}

.actions {
  padding-left: 2rem;

  .inner {
    justify-content: flex-end;
  }

  .icon {
    margin-left: 0.5rem;
    width: 1.25rem;
    height: 1.25rem;
  }
}

.end {
  min-width: 1rem;
}

/* Colors */
.Route {
  color: var(--c-white);
  will-change: color, background-color;
  transition: color 0.1s ease-in-out, background-color 0.1s ease-in-out;

  &.virtual {
    color: var(--c-gray-active);
  }

  &.disabled {
    background-size: 0.5rem 0.5rem;
    background-image: var(--c-disabled-route-bg);
  }

  &.hit {
    background-color: var(--c-green);
  }
}

.col {
  .disabled &:not(.actions):not(.def) {
    opacity: 0.4;
  }
}

.collapse {
  fill: var(--c-gray-active);

  .virtual & {
    fill: var(--c-gray-inactive);
  }
}

.path {
  .disabled & {
    opacity: 0.4;
  }
}

.add {
  fill: var(--c-gray-active);
}

.remove {
  fill: var(--c-green);
}

.to {
  fill: var(--c-gray-inactive);
}

.actions .icon {
  fill: var(--c-gray-active);

  &.disabled {
    opacity: 0.175;
  }

  &.active {
    fill: var(--c-green);
  }
}
</style>
