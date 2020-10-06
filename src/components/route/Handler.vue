<template>
  <div class="Handler">
    Handler
    <!-- <div class="col handler full">
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
    </div> -->
  </div>
</template>
