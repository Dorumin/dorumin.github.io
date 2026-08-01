<script lang="ts">
    import JsonViewer from './JsonViewer.svelte';

    let inputText = $state('');
    let value = $derived(parseInput());

    function parseInput() {
        try {
            return JSON.parse(inputText);
        } catch (_) {
            return null;
        }
    }
</script>

<textarea bind:value={inputText}></textarea>

{#if value == null}
    <p>Paste valid json to see it visualized. You will be able to access it through window.json</p>
{:else}
    <JsonViewer {value} />
{/if}

<style lang="scss">
    textarea {
        background: #333;
        width: 100%;
        height: 160px;
        color: white;
        font-family: Consolas, monospace;
    }
</style>
