<script lang="ts">
    import MicroGallery from "$lib/components/MicroGallery.svelte";
    import GalleryItem from "./GalleryItem.svelte";

    let count = 0;
</script>

{count}

<button on:click={() => count -= 1}>-</button>
<button on:click={() => count += 1}>+</button>

<MicroGallery
    component={GalleryItem}
    {count}
    height={'360px'}
    width={'240px'}
/>