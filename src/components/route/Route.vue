<template>
  <div :class="['Route', {
      isParent,
      hit,
      virtual: route.virtual,
      opened: route.opened,
      disabled: selectedVerb?.disabled
    }]">
    <div class="col def">
      <div class="inner">
        <div
          class="level"
          :style="{ width: `${(showVirtual ? route.level : 1) * 0.75}rem` }"
        />
        <Clickable
          v-if="showVirtual"
          class="collapse"
          icon="chevron"
          @click="$emit('toggle-route')"
        />
        <Input
          class="path"
          :value="showVirtual ? route.path : route.fullPath"
        />
        <div class="verbs">
          <!-- <Verb v-if="route.global"
            key="all"
            type="all"
            :selected="route.selected === 'global'"
            @click="$emit('select-verb', 'global')"
          /> -->
          <Verb v-for="verb in route.verbs"
            :key="verb.type"
            :type="verb.type"
            :selected="route.selected === verb.type"
            :disabled="verb.disabled"
            @click="$emit('select-verb', verb.type)"
          />
          <Clickable
            v-if="!route.virtual"
            class="remove"
            icon="minus"
          />
          <Clickable
            v-if="!route.virtual"
            class="add"
            icon="plus"
          />
        </div>
      </div>
    </div>
    <div class="col to">
      <div v-if="!route.virtual" class="inner">
        <Icon class="icon" name="route" />
      </div>
    </div>
    <div class="col handler full">
      <div v-if="!route.virtual" class="inner">
        <Clickable
          :class="['icon', 'proxy', { active: handler === 'proxy' }]"
          icon="proxy"
          title="Proxy route"
        />
        <Clickable
          :class="['icon', { active: handler === 'service' }]"
          icon="file-js"
          title="Handle response in JS file"
          @click="onHandlerClick('service')"
        />
        <Clickable
          :class="['icon', { active: handler === 'static' }]"
          icon="file-json"
          title="Handle response in JSON file"
          @click="onHandlerClick('static')"
        />
        <Clickable
          :class="['icon', { active: handler === 'body' }]"
          icon="json"
          title="Route response"
          @click="onHandlerClick('body')"
        />
        <component
          v-if="handlerValue"
          :is="inline ? 'Input' : 'button'"
          :class="['input', { inline, editing }]"
          :value="handlerValue"
          @click="!inline && $emit('toggle-editor', handlerValue)"
        >
          <template v-if="!inline && handlerValue">
            <Icon class="arrow-icon" name="arrow"/>
            {{ handlerValue.replace(/\s/g, '') }}
          </template>
        </component>
      </div>
    </div>
    <div class="col middleware">
      <div v-if="!route.virtual" class="inner">
        <Throttle :verb="selectedVerb"/>
      </div>
    </div>
    <div class="col middleware">
      <div v-if="!route.virtual" class="inner">
        <Fail :verb="selectedVerb"/>
      </div>
    </div>
    <div class="col middleware">
      <div v-if="!route.virtual" class="inner">
        <Headers :verb="selectedVerb"/>
      </div>
    </div>
    <div class="col actions">
      <div class="inner">
        <Clickable
          :class="['icon', { disabled: !route.virtual }]"
          icon="plus"
          title="Create route"
        />
        <Clickable
          :class="['icon', {
            disabled: route.virtual,
            active: selectedVerb?.disabled
          }]"
          icon="disable"
          title="Disable route"
        />
        <Clickable
          :class="['icon', { disabled: route.virtual }]"
          icon="minus"
          title="Delete route"
        />
      </div>
    </div>
    <div class="col end"/>
  </div>
</template>

<script>
import { computed } from 'vue'
import Clickable from '@/components/common/Clickable'
import Input from '@/components/common/Input'
import Icon from '@/components/common/Icon'
import Verb from './Verb'
import Throttle from './Throttle'
import Fail from './Fail'
import Headers from './Headers'

export default {
  name: 'Route',
  components: { Clickable, Input, Icon, Verb, Throttle, Fail, Headers },
  props: {
    route: Object,
    showVirtual: Boolean,
    isParent: Boolean,
    editing: Boolean,
    hit: Boolean
  },
  setup (props, { emit }) {
    const selectedVerb = computed(() => props.route.selected === 'global'
      ? props.route.global
      : props.route.verbs?.find(verb => verb.type === props.route.selected)
    )

    const handler = computed(() => {
      const type = selectedVerb?.value?.type

      if (!type) {
        return
      }

      return type === 'proxy'
        ? 'proxy'
        : Object.keys(selectedVerb?.value?.handler)[0]
    })

    // const selectedVerbType = computed(() => selectedVerb.value?.type === 'all'
    //   ? ''
    //   : selectedVerb.value?.type)

    const selectedVerbType = computed(() => selectedVerb.value?.type)

    const handlerValue = computed(() => {
      let fileName

      switch (handler.value) {
        case 'proxy':
          return selectedVerb.value.handler
        case 'service':
          fileName = props.route.fullPath
            .split('/')
            .slice(1)
            .filter(p => !p.startsWith(':'))
            .join('.') + (selectedVerbType.value && `.${selectedVerbType.value}`)
          return `./services/${fileName}.js`
        case 'static':
            fileName = props.route.fullPath.split('/').slice(1).join('.')
          return `./static/${fileName}.json`
        case 'body':
          return JSON.stringify(selectedVerb.value.handler, null, 2)
        default:
          return ''
      }
    })

    const inline = computed(() => ['proxy'].includes(handler.value))

    const onHandlerClick = type => {
      if (handler.value === type) {
        emit('toggle-editor', handlerValue.value)
      }
    }

    return { handler, handlerValue, inline, selectedVerb, onHandlerClick }
  }
}
</script>

<style lang="postcss" scoped>
.Route {
  display: table-row;
  font-size: .9rem;
}

.col {
  display: table-cell;
  vertical-align: top;

  &.full {
    width: 100%;
  }
}

.inner {
  display: flex;
  align-items: center;
  padding: .25rem 0;
  height: 2.5rem;
}

.collapse {
  visibility: hidden;
  width: 1rem;
  height: 1rem;
  margin: 0 .25rem .125rem 0;
  will-change: transform;
  transition: transform .2s ease-in-out;

  .isParent & {
    visibility: visible;
  }

  .opened & {
    transform: rotate(90deg);
  }
}

.path {
  margin-right: .5rem;
}

.verbs {
  display: flex;
  align-items: center;
}

.add,
.remove {
  width: 1rem;
  height: 1rem;
  margin-right: .25rem;
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
  margin: .25rem 0 0 .25rem;
  white-space: nowrap;
  overflow: auto hidden;
}

.handler {
  .input {
    min-width: 10rem;
    font-size: .9rem;
    margin-right: 1rem;
    display: flex;
    align-items: center;

    &:not(.inline) {
      margin-left: .5rem;
      display: block;
      /* max-width: 25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis; */
    }

    .arrow-icon {
      width: .75rem;
      height: .75rem;
      will-change: transform;
      transition: transform .2s ease-in-out;
    }

    &.editing .arrow-icon {
      transform: rotate(90deg);
    }
  }
}

.actions {
  padding-left: 2rem;

  .inner {
    justify-content: flex-end;
  }

  .icon {
    margin-left: .5rem;
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
  transition: color .2s ease-in-out, background-color .5s ease-in-out;

  &.virtual {
    color: var(--c-gray-active);
  }

  &.disabled {
    background-size: .5rem .5rem;
    background-image: var(--c-disabled-route-bg);
  }

  &.hit {
    background-color: var(--c-green);
  }
}

.col {
  .disabled &:not(.actions):not(.def) {
    opacity: .4;
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
    opacity: .4;
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

.icon {
  fill: var(--c-gray-inactive);

  &:hover,
  &.active {
    fill: var(--c-green);

    &.proxy {
      fill: var(--c-blue);
    }
  }
}

.handler .input {
  &:not(.inline) {
    color: var(--c-gray-active);
  }

  .arrow-icon {
    fill: var(--c-gray-active);
    will-change: fill;
    transition: fill .2s ease-in-out;
  }

  &:not(.inline):hover,
  &.editing {
    color: var(--c-green);

    .arrow-icon {
      fill: var(--c-green);
    }
  }
}

.actions .icon {
  fill: var(--c-gray-active);

  &.disabled {
    opacity: .175;
  }

  &.active {
    fill: var(--c-green);
  }
}
</style>