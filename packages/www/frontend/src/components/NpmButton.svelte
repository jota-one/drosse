<script>
    import Icon from './Icon.svelte'

    export let command = ''
</script>

<button on:click={() => { navigator.clipboard.writeText(command) }}>
    <code>{ command }</code>
    <Icon name="copy" size="20"/>
</button>

<style lang="postcss">
    button {
        display: flex;
        align-items: center;
        padding: 0.75rem;
        white-space: nowrap;
        font-size: 0.8rem;
        color: rgb(80,80,80);
        border: 2px solid rgba(128,128,128, 0.25);
        background: rgba(128,128,128, 0.1);
        border-radius: 0.3rem;
        cursor: pointer;

        :global(.dark) & {
            color: rgb(160,160,160);
            border-color: rgba(128,128,128, 0.35);
            background: rgb(25,25,25);

            &:hover code {
                color: rgb(160,160,160);
            }
        }

        &:hover {
            color: var(--c-green);
            border-color: var(--c-green);

            code {
                color: rgb(80,80,80);
            }
        }
    }

    code {
        margin: 0 0.75rem -0.125rem 0;
    }
</style>