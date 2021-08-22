<script>
  import { onMount } from 'svelte'
  import Typed from 'typed.js'

  export let steps = ''
  let currentCommand = 0
  let shell

  $: _steps = JSON.parse(steps)

  const typedOptions = {
    typeSpeed: 30,
    loop: false,
    startDelay: 1000,
  }

  onMount(async () => {
    for (const step of _steps) {
      await execute(step)
      currentCommand++
    }
  })

  function execute(step) {
    return new Promise(resolve => {
      const cmdEl = shell.querySelector(
        `.command:nth-child(${currentCommand + 1})`
      )

      const el = cmdEl.querySelector('.typed')

      const options = {
        ...typedOptions,
        ...step.options,
        strings: [step.command],
        onComplete: onTypedCommplete,
      }

      async function onTypedCommplete(self) {
        if (!options.loop) {
          self.el.parentElement.querySelector('.typed-cursor').style.display =
            'none'
        }

        let i = 0

        const interval = window.setInterval(() => {
          if (i === step.output.length - 1) {
            window.clearInterval(interval)
            resolve(true)
          }

          const lineEl = cmdEl.querySelector(`.line-${i}`)
          lineEl.classList.add('show')
          lineEl.innerHTML = lineEl.innerHTML.replace('js:now', now())
          i++
        }, 50)
      }

      cmdEl.classList.add('show')
      new Typed(el, options)
    })
  }

  function pad(input) {
    var str = input.toString()
    try {
      return str.padStart(2, '0')
    } catch (e) {
      return str
    }
  }

  function now() {
    const d = new Date()
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  }

</script>

<div class="terminal">
  <div class="ratio" />
  <div class="window">
    <div />
    <div />
    <div />
  </div>
  <div class="shell" bind:this={shell}>
    {#each JSON.parse(steps) as step}
      <code class="command">
        <span class="green">$</span> <span class="typed" />
        {#each step.output as line, i}
          <span class="line line-{i}">{@html line}</span>
        {/each}
      </code>
    {/each}
  </div>
</div>

<style lang="postcss">
  @import '../styles/_media.pcss';

  .terminal {
    position: relative;
    width: 100%;
    background-color: var(
      --j-terminal-background-color,
      rgba(245, 245, 245, 0.9)
    );
    border: 1px solid var(--j-terminal-border-color, rgba(0, 0, 0, 0.125));
    border-radius: 0.35rem;
    box-shadow: 0 0.25rem 1.5rem
      var(--j-terminal-box-shadow-color, rgb(0 0 0 / 20%));

    .ratio {
      content: '';
      display: block;
      height: 0;
      width: 100%;
      padding-bottom: 100%;

      @media (--xs) {
        padding-bottom: 75%;
      }

      @media (--s) {
        padding-bottom: 65%;
        min-width: 35rem;
      }

      @media (--m) {
        padding-bottom: 57.5%;
      }
    }
  }

  .window {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    padding: 0.75rem;

    div {
      width: 0.65rem;
      height: 0.65rem;
      margin-right: 0.375rem;
      border-radius: 50%;
      background: var(--j-terminal-window-dots-color, rgb(200, 200, 200));
    }
  }

  .shell {
    position: absolute;
    top: 1.75rem;
    bottom: 0;
    overflow: auto;
    right: 0;
    left: 0;
    padding: 1rem 1.5rem 1.5rem;
    font-size: 0.825rem;
    color: var(--j-terminal-text-color, rgb(113, 113, 113));

    @media (--xl) {
      font-size: 0.785rem;
    }
  }

  .command:not(.show),
  .line:not(.show) {
    display: none;
  }

  .line {
    display: block;
  }

  code {
    display: block;
  }

  :global .blue {
    color: rgb(59, 130, 246);
  }

  :global .green {
    color: rgb(74, 222, 128);
  }

  :global .pink {
    color: rgb(219, 39, 119);
  }

  :global .opacity-75 {
    opacity: 0.5;
  }

  :global .opacity-50 {
    opacity: 0.5;
  }

  :global .opacity-25 {
    opacity: 0.25;
  }

</style>
