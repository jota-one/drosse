<svelte:options tag={null} />

<script>
  import icons from '../icons.json'

  export let name
  export let size = 24
  export let color = 'currentColor'

</script>

<svg viewBox="0 0 24 24" width={size} height={size}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    fill={color}
    d={icons[name] || icons._default}
  />
</svg>
