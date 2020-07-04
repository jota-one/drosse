<template>
  <div class="Server">
    <h2><Input value="cool-app" /></h2>
    <section class="config">
      <Drosse />
      <div class="port">
        :<Input class="input" value="8000" />
      </div>
      <Input class="root" value="/Users/tadai/dev/cool-app" />
    </section>
    <section class="routes">
      <Route />
    </section>
  </div>
</template>

<script>
import Drosse from '@/components/common/Drosse'
import Input from '@/components/common/Input'
import Route from '@/components/route/Route'

export default {
  name: 'Server',
  components: { Drosse, Input, Route }
}
</script>

<style lang="postcss" scoped>
h2 {
  display: inline-flex;
  margin: 0 0 1rem 0;
  padding: 0;
  font-weight: 400;
}

.config {
  display: flex;
  align-items: center;
  padding-bottom: .75rem;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  border-bottom: 1px dashed;
}

.drosse {
  margin: 0 .25rem 0 0;
  width: 3.5rem;
  height: 3.5rem;
}

.port {
  display: flex;
  align-items: center;
  margin-right: 1rem;

  .input {
    margin-left: -.25rem;
  }
}

.root {
  font-size: 1rem;
}

/* Colors */
.port {
  color: var(--c-green);
}

.config {
  border-bottom-color: var(--c-gray-inactive);
}
</style>