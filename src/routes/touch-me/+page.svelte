<script lang="ts">
    import { onDestroy, onMount } from 'svelte';

    const colors = ['red', 'blue', 'green', 'yellow', 'magenta', 'orange', 'purple'];
    let touches: Record<number, Touch> = $state({});
    let lastChange: Touch[] = $state([]);

    $effect(() => {
        window.addEventListener('touchstart', onTouchStart, { passive: false });
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd, { passive: false });

        return () => {
            window.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    });

    function onTouchStart(e: TouchEvent) {
        console.log('start', e);
        for (const touch of e.changedTouches) {
            touches[touch.identifier] = touch;
        }
    }

    function onTouchMove(e: TouchEvent) {
        e.preventDefault();
        console.log('move', e);
        for (const touch of e.changedTouches) {
            touches[touch.identifier] = touch;
        }

        lastChange = [...e.changedTouches];
    }

    function onTouchEnd(e: TouchEvent) {
        console.log('end', e);
        for (const touch of e.changedTouches) {
            delete touches[touch.identifier];
        }
    }
</script>

<div class="touchy">
    <ol>
        {#each Object.values(touches) as touch (touch)}
            <li>{touch.identifier}: {~~touch.clientX}x{~~touch.clientY}</li>
        {/each}
    </ol>

    Last update event changed {lastChange.length} touch points

    {#each Object.values(touches) as touch, index (touch)}
        <div class="touch-display" style:--color={colors[index] ?? 'white'} style:--x="{touch.clientX}px" style:--y="{touch.clientY}px">
            <div class="vertical"></div>
            <div class="horizontal"></div>
        </div>
    {/each}
</div>

<style lang="scss">
    .touchy {
        font-size: 48px;
        line-height: 48px;
        padding: 16px 32px;
    }

    .touch-display {
        position: fixed;
        top: var(--y);
        left: var(--x);
    }

    .vertical {
        position: absolute;
        width: 1px;
        height: 10000px;
        transform: translate(-50%, -50%);
        background-color: var(--color);
    }

    .horizontal {
        position: absolute;
        width: 10000px;
        height: 1px;
        transform: translate(-50%, -50%);
        background-color: var(--color);
    }

    :global(html) {
        touch-action: manipulation;
    }
</style>
