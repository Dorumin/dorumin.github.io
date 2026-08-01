<script lang="ts">
    // @hmr:keep-all

    import VirtualizedList from "$lib/components/VirtualizedList.svelte";
    import ListItem from './ListItem.svelte';

    type ScrollEvent = {
        direction: 'up' | 'down';
        count: number;
        pixels: number
    };

    let scrollEvents: ScrollEvent[] = [];

    function onWheel(e: WheelEvent) {
        if (e.deltaY === 0) return;

        const direction = e.deltaY > 0 ? 'down' : 'up';

        if (scrollEvents.length === 0 || scrollEvents[0].direction !== direction) {
            scrollEvents.unshift({
                direction,
                count: 1,
                pixels: Math.abs(e.deltaY)
            });
            scrollEvents = scrollEvents;
        } else {
            scrollEvents[0].count += 1;
            scrollEvents[0].pixels += Math.abs(e.deltaY);
        }
    }
</script>

<div class="scrolling-events">
    <table class="scroll-events-table">
        {#each scrollEvents as scrollEvent}
            <tr class="scroll-event">
                <td class="direction">{scrollEvent.direction}</td>
                <td class="count">{scrollEvent.count}x</td>
                <td class="pixels">{scrollEvent.pixels}px</td>
            </tr>
        {/each}
    </table>
</div>

<VirtualizedList itemCount={400} component={ListItem} on:wheel={onWheel} on:scroll={e => e.detail} />

<style>
    .scrolling-events {
        position: absolute;
        top: 0;
        right: 0;
        height: 80px;
        width: 200px;
        overflow-y: auto;
        transition: height linear 100ms;
    }

    .scrolling-events:hover {
        height: 400px;
    }

    .scrolling-events::-webkit-scrollbar {
        display: none;
    }
</style>
