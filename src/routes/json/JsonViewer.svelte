<script lang="ts">
    const { value, indent = 0 } = $props();

    $effect(() => {
        // @ts-expect-error We're setting a random global, what did you expect?
        globalThis.json = value;
    });
</script>

{typeof value}

{#if typeof value == 'string'}
    <span class="string">{value}</span>
{:else if typeof value == 'number'}
    <span class="number">{value}</span>
{:else if value === null}
    <span class="null">null</span>
{:else if value === null}
    <span class="null">nulls</span>
{/if}

<style lang="scss">
    .property {
        color: #4fdee5;
    }

    .string {
        color: #01ff70;
    }

    .number {
        color: #f5b041;
    }
</style>
