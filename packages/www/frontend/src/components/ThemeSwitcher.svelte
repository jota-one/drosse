<script>
  import { onMount } from 'svelte'
  import Icon from './Icon.svelte'

  export let defaultTheme = 'system'
  let theme = 'light'
  let self

  $: iconName = theme === 'light' ? 'moon' : 'sun'

  function toggle() {
    theme = theme === 'light' ? 'dark' : 'light'

    if (theme === 'light') {
      document.querySelector('html').classList.remove('dark')
      document.querySelector('html').classList.add('light')
    } else {
      document.querySelector('html').classList.remove('light')
      document.querySelector('html').classList.add('dark')
    }

    window.dispatchEvent(
      new CustomEvent('themeSwitched', {
        detail: { theme },
      })
    )
  }

  onMount(() => {
    if (defaultTheme === 'system') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        theme = 'dark'
      } else {
        theme = 'light'
      }
    } else {
      theme = defaultTheme
    }

    document.querySelector('html').classList.add(theme)

    window.dispatchEvent(
      new CustomEvent('themeSwitched', {
        detail: { theme },
      })
    )
  })

</script>

<button on:click={toggle} bind:this={self}>
  <Icon name={iconName} size="32" />
</button>

<style lang="postcss">
  button {
    margin: 0;
    padding: 0;
    color: rgb(147, 147, 147);
    border: none;
    background: none;
    cursor: pointer;
  }

</style>
