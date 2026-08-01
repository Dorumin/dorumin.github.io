<script lang="ts">
    let cw = $state(0);
    let ch = $state(0);
</script>

<svelte:head>
    <meta name="viewport" content="" />
</svelte:head>

<div class="container">
    <div class="viewportz" bind:clientHeight={ch} bind:clientWidth={cw}>vh ({cw}x{ch})</div>

    <div class="content">
        text text
    </div>
</div>

<style lang="scss">
    .container {
        overflow: auto;
        position: relative;
    }

    .viewportz {
        position: absolute;
        background: red;
        width: 100vw;
        height: 100vh;
    }

    .content {
        width: 1600px;
        height: 3600px;
        z-index: 1;
    }
</style>
