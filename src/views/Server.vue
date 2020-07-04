<template>
  <main class="Server">
    <h2>cool-app</h2>
    <div class="config">
      <button class="drosse">
        <Drosse />
      </button>
      <div class="port">
        :<Input class="input" value="8000" />
      </div>
      <Input class="root" value="/Users/tadai/dev/cool-app" />
    </div>
  </main>
</template>

<script>
import Drosse from '@/components/common/Drosse'
import Input from '@/components/common/Input'

export default {
  name: 'Server',
  components: { Drosse, Input }
}
</script>

<style lang="postcss" scoped>
.Server {
  margin: 2rem 3rem;
}

.config {
  display: flex;
  align-items: center;
  font-size: 1.25rem;
}

.drosse {
  margin: 0 .25rem .25rem 0;
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

h2 {
  margin: 0;
  padding: 0;
  font-weight: 400;
}

/* Colors */
.port {
  color: var(--c-green);
}
</style>