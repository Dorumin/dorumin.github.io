<script lang="ts">
    import ForeverLoader from '$lib/components/ForeverLoader.svelte';

    let loaded: boolean = false;
</script>

<div class="loading-page">
    {#if !loaded}
        <ForeverLoader onLoaded={() => loaded = true} />
    {:else}
        <div class="loaded-content">
            Loaded!
        </div>
    {/if}
</div>

<style lang="scss">
    .loading-page {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
    }

    .loaded-content {
        font-size: 24px;
    }
</style>
