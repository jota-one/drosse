<template>
  <div class="Handler">
    <div v-if="!route.virtual" class="inner">
      <Clickable
        :class="[
          'icon',
          'proxy',
          {
            active: handler === 'proxy',
            inherited: selectedVerb.inherited.proxy,
          },
        ]"
        icon="proxy"
        title="Proxy route"
        @click="onHandlerClick('proxy')"
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
      <Input
        v-if="value.type === 'inline'"
        class="input"
        :value="value.content"
        @click="onValueClick"
      />
      <button v-else class="button" @click="onValueClick">
        <span v-if="value.type === 'content'">
          {{ value.content }}
        </span>
        <template v-if="value.type === 'path'">
          <template v-for="(part, i) in value.content">
            <span :key="`part-${part.value}-${i}`" :class="['path', part.type]">
              {{ part.value }}
            </span>
            <span
              v-if="i < value.content.length - 1"
              :key="`sep-${part.value}-${i}`"
              class="sep"
            >
              {{ part.type !== 'root' ? '.' : '/' }}
            </span>
          </template>
        </template>
      </button>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import Clickable from '@/components/common/Clickable'
import Input from '@/components/common/Input'

export default {
  name: 'Handler',
  components: { Clickable, Input },
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
    const multiple = ref(false)
    const selectedVerbType = computed(() => props.selectedVerb?.type)

    const handler = computed(() =>
      selectedVerbType.value
        ? selectedVerbType.value === 'proxy'
          ? 'proxy'
          : Object.keys(props.selectedVerb?.handler)[0]
        : null
    )

    const value = computed(() => {
      switch (handler.value) {
        case 'body':
          return {
            type: 'content',
            content: JSON.stringify(
              props.selectedVerb.handler,
              null,
              2
            ).replace(/\s/gim, ''),
          }
        case 'proxy':
          return {
            type: 'inline',
            content: props.selectedVerb.handler,
          }
        case 'service':
          return {
            type: 'path',
            content: [
              ...[{ type: 'root', value: './services' }],
              ...props.route.fullPath
                .split('/')
                .slice(1)
                .filter(p => !p.startsWith(':'))
                .map(value => ({ type: 'part', value: value })),
              ...[
                { type: 'verb', value: selectedVerbType.value },
                { type: 'extension', value: 'js' },
              ],
            ],
          }
        case 'static':
          return {
            type: 'path',
            content: [
              ...[{ type: 'root', value: './static' }],
              ...props.route.fullPath
                .split('/')
                .slice(1)
                .map(value => ({
                  type: value.startsWith(':') ? 'variable' : 'part',
                  value: value.replace(/:([^\\/\\.]+)/gim, '{$1}'),
                })),
              ...[
                { type: 'verb', value: selectedVerbType.value },
                { type: 'extension', value: 'json' },
              ],
            ],
          }
        default:
          return ''
      }
    })

    const onHandlerClick = type => {
      alert(`${type} action not yet implemented...`)
    }

    const onValueClick = () => {
      const path = value.value.content
        .map((p, i) =>
          p.type === 'root'
            ? `${p.value}/`
            : i < value.value.content.length - 1
            ? `${p.value}.`
            : p.value
        )
        .join('')

      emit('open-file', path)
    }

    return {
      handler,
      value,
      multiple,
      onHandlerClick,
      onValueClick,
    }
  },
}
</script>

<style lang="postcss" scoped>
.icon {
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
}

.input,
.button {
  display: flex;
  align-items: center;
  margin: 0.125rem 0 0 0.5rem;
  line-height: 1.5;
}

.path {
  display: block;
  padding: 0.125rem 0 0.125rem;
  border-radius: 0.25rem;

  &.root,
  &.variable,
  &.verb {
    padding-right: 0.25rem;
    padding-left: 0.25rem;
  }

  &.root {
    font-size: 0.7rem;
    color: var(--c-black);
    background-color: rgba(255, 255, 255, 0.2);
  }

  &.verb,
  &.variable {
    font-size: 0.8rem;
    background-color: rgba(0, 0, 0, 0.25);
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

      &.inherited:not(:hover) {
        opacity: 0.5;
      }
    }
  }
}

.button {
  color: var(--c-gray-active);

  &:hover {
    color: var(--c-green);
  }
}
</style>
