<script lang="ts" context="module">
    import { writable } from 'svelte/store';

    const moving = writable(0);
</script>

<script lang="ts">
    import { onNavigate } from '$app/navigation';

    onNavigate(() => {
        console.log('set to 1');
        moving.set(1);

        return new Promise((res) => {
            setTimeout(() => {
                res();
                moving.set(0);
            }, 500);
        });
    });
</script>

<div class="transitions-page">
    <div class="nav">
        <a href="./p1">p1</a>
        <a href="./p2">p2</a>

        moving: {$moving}
    </div>

    <slot></slot>

    <div class="transition-spinner" style:opacity={$moving}>spin</div>
</div>

<style lang="scss">
    .transition-spinner {
        opacity: 0;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        transition: opacity 500ms linear;
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: red;
    }
</style>
