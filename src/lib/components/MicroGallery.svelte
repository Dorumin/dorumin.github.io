<script lang="ts">
    import type { ComponentType, SvelteComponentTyped } from 'svelte';

    type FlowVariants = 'vertical' | 'horizontal';
    type ChildComponentProps = {
        index: number;
    };

    export let flow: FlowVariants = 'vertical';
    export let component: ComponentType<SvelteComponentTyped<ChildComponentProps>>;
    export let count: number;

    export let height: string;
    export let width: string;

    $: maxItemSegments = Math.ceil(Math.sqrt(count));
    $: minItemSegmentsEstimate = Math.floor(Math.sqrt(count));
    // We need to separate the "fake/temp" min item segment count from the real one, because it's an estimation
    // If the amount of items can't fit in a rectangle of size minItemSegments*maxItemSegments, there's no point
    // Round up, have a square that fits everything, then lay out the final elements stretched
    // However, the original minItemSegments is useful in laying out the normal items before the real ones
    $: minItemSegments = minItemSegmentsEstimate * maxItemSegments < count ? maxItemSegments : minItemSegmentsEstimate;
    $: normalLayoutCount = minItemSegmentsEstimate * maxItemSegments;
    $: remainingAbnormalItems = count > normalLayoutCount ? count - normalLayoutCount : 0;

    $: columnCount = flow === 'vertical' ? maxItemSegments : minItemSegments;
    $: rowCount = flow === 'vertical' ? minItemSegments : maxItemSegments;
</script>

{flow}

{columnCount}
{rowCount}

Normal count: {normalLayoutCount}
Remaining: {remainingAbnormalItems}

<div
    class="micro-gallery-container"
    style:height
    style:width
>
    {#each { length: Math.max(count, 0) } as _, index (index)}
        {@const isFillItem = index >= normalLayoutCount}
        {@const minStretch = isFillItem && flow === 'vertical'
            ? 100 / remainingAbnormalItems
            : 100 / minItemSegments
        }
        {@const maxStretch = isFillItem && flow === 'horizontal'
            ? 100 / remainingAbnormalItems
            : 100 / maxItemSegments
        }
        {@const height = flow === 'vertical' ? minStretch : maxStretch}
        {@const width = flow === 'vertical' ? maxStretch : minStretch}

        <div
            class="micro-gallery-item"
            class:fill-item={isFillItem}
            style:height="{height}%"
            style:width="{width}%"
        >
            {minStretch.toFixed(0)} {maxStretch.toFixed(0)}
            <!-- <svelte:component this={component} index={index} /> -->
        </div>
    {/each}
</div>

<style lang="scss">
    .micro-gallery-container {
        height: 360px;
        width: 240px;
        background: black;
        display: flex;
        flex-wrap: wrap;
        border: 1px solid red;
        position: relative;
    }
</style>
