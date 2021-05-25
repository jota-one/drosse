<script>
  import Icon from './Icon.svelte'

  export let command = ''

</script>

<button
  on:click={() => {
    navigator.clipboard.writeText(command)
  }}
>
  <code>{command}</code>
  <Icon name="copy" size="20" />
</button>

<style lang="postcss">
  button {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    white-space: nowrap;
    font-size: 0.8rem;
    color: var(--j-npm-button-text-color, rgb(80, 80, 80));
    border: 2px solid
      var(--j-npm-button-border-color, rgba(128, 128, 128, 0.25));
    background: var(--j-npm-button-background-color, rgba(128, 128, 128, 0.1));
    border-radius: 0.3rem;
    cursor: pointer;
  }

  button:hover {
    color: var(--j-npm-button-hover-color, inherit);
    border-color: var(--j-npm-button-hover-color, inherit);
  }

  code {
    margin: 0 0.75rem -0.1rem 0;
    color: var(--j-npm-button-text-color, rgb(80, 80, 80));
  }

</style>
