<template>
  <div class="Handler">
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
        :is="inline ? 'Input' : 'button'"
        v-if="handlerValue"
        :class="['input', { inline, editing }]"
        :value="handlerValue"
        @click="onHandlerValueClick"
      >
        <template v-if="!inline && handlerValue">
          <Icon class="arrow-icon" name="arrow" />
          <span>{{ handlerValue.replace(/\s/g, '') }}</span>
        </template>
      </component>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import Clickable from '@/components/common/Clickable'
import Icon from '@/components/common/Icon'
import Input from '@/components/common/Input'

export default {
  name: 'Handler',
  components: { Clickable, Icon, Input },
  props: {
    route: {
      type: Object,
      default: () => ({}),
    },
    selectedVerb: {
      type: Object,
      default: null,
    },
    editing: Boolean,
  },
  setup(props, { emit }) {
    // const { openFile } = useIo()

    const selectedVerbType = computed(() => props.selectedVerb?.type)

    const handler = computed(() =>
      selectedVerbType.value
        ? selectedVerbType.value === 'proxy'
          ? 'proxy'
          : Object.keys(props.selectedVerb?.handler)[0]
        : null
    )

    const shorten = (path, withVariables) => {
      const arr = path
        .split('/')
        .slice(1)
        .filter(p => (withVariables ? true : !p.startsWith(':')))

      return arr
        .map((p, i) => {
          return p // i < arr.length - 1 ? '' : p
        })
        .join('.')
        .replace(/\.{3,}/, '...')
    }

    const compress = json => JSON.stringify(json, null, 2)

    const handlerValue = computed(() => {
      let fileName

      switch (handler.value) {
        case 'proxy':
          return props.selectedVerb.handler
        case 'service':
          fileName =
            shorten(props.route.fullPath) +
            (selectedVerbType.value && `.${selectedVerbType.value}`)
          return `./services/${fileName}.js`
        case 'static':
          fileName = shorten(props.route.fullPath, true)
          return `./static/${fileName}.json`
        case 'body':
          return compress(props.selectedVerb.handler)
        default:
          return ''
      }
    })

    const inline = computed(() => ['proxy'].includes(handler.value))

    const onHandlerClick = type => {
      console.log('select', type)
    }

    const onHandlerValueClick = () => {
      console.log('open-file', handlerValue.value)
      emit('open-file', handlerValue.value)
    }

    return {
      inline,
      handler,
      handlerValue,
      onHandlerClick,
      onHandlerValueClick,
    }
  },
}
</script>

<style lang="postcss" scoped>
.icon {
  width: 2rem;
  height: 2rem;
}

.input {
  min-width: 10rem;
  /* max-width: 25rem; */
  font-size: 0.9rem;
  margin: 0 1rem 0 0.5rem;
  display: flex;
  flex-shrink: 0;
  align-items: center;

  span {
    display: block;
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .arrow-icon {
    flex-shrink: 0;
    margin-right: 0.25rem;
    width: 0.75rem;
    height: 0.75rem;
    will-change: transform;
    transition: transform 0.2s ease-in-out;
  }

  &.editing .arrow-icon {
    transform: rotate(90deg);
  }
}

/* Colors */
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

.input {
  &:not(.inline) {
    color: var(--c-gray-active);
  }

  .arrow-icon {
    fill: var(--c-gray-inactive);
    will-change: fill;
    transition: fill 0.2s ease-in-out;
  }

  &:not(.inline):hover,
  &.editing {
    color: var(--c-green);

    .arrow-icon {
      fill: var(--c-green);
    }
  }
}
</style>
