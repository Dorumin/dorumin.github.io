<script lang="ts">
    let urlValue = $state('');
    let sliderBytes = $state(1);
    let sliderMax = $state(1);
    let statusMessage = $state('No image loaded.');
    let fixStaleProgressiveRenders = $state(true);
    let expand = $state(false);

    let sourceBlob = $state(null as Blob | null);
    let currentObjectURL = $state(null as string | null);

    function revokeCurrentURL() {
        if (currentObjectURL) {
            URL.revokeObjectURL(currentObjectURL);
            currentObjectURL = null;
        }
    }

    function updateImage() {
        if (!sourceBlob) return;

        revokeCurrentURL();

        const length = sliderBytes;
        const partialBlob = sourceBlob.slice(0, length, sourceBlob.type);

        currentObjectURL = URL.createObjectURL(partialBlob);

        statusMessage = `Bytes: ${length} / ${sourceBlob.size} (${Math.round(length / sourceBlob.size * 100)}%)`;
    }

    async function loadBlob(blob: Blob) {
        sourceBlob = blob;

        sliderMax = blob.size;
        sliderBytes = blob.size;

        updateImage();
    }

    async function onLoadClick() {
        const url = urlValue.trim();
        if (!url) return;

        try {
            statusMessage = 'Downloading...';

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(response.statusText || `Code: ${response.status}`);
            }

            const blob = await response.blob();

            await loadBlob(blob);
        } catch (err) {
            console.log(err);
            statusMessage = `Failure. ${err}`;
            console.error(err);
        }
    }

    async function onFileChange(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        await loadBlob(file);
    }

    function onImageLoad(e: Event) {
            console.log('loaded');

            if (!fixStaleProgressiveRenders) return;

            const img = e.currentTarget as HTMLElement;
            const src = img.getAttribute('src');

            let i = 0;
            const MAX_FLICKS = 2;

            function queue() {
                if (img.getAttribute('src') !== src) return;

                img.style.filter = i % 2 ? 'brightness(1)' : '';

                i++;

                if (i > MAX_FLICKS) return;

                requestAnimationFrame(queue);
            }

            queue();
    }
</script>

<div class="controls">

    <label>
        Load file
        <input
            id="file"
            type="file"
            accept="image/*"
            onchange={onFileChange}
        />
    </label>

    <label>
        Load url
        <input id="url" type="text" placeholder="https://dorum.in/favicon.ico" bind:value={urlValue} />
    </label>

    <button type="button" id="load" onclick={onLoadClick}>Fetch URL</button>

    <label title="The blink and gecko engines (so, all of them) do not handle repaints gracefully after an image stream ends during progressive decoding. Can cause flicker">
        Fix stale progressive renders
        <input type="checkbox" bind:checked={fixStaleProgressiveRenders} />
    </label>

    <div id="status">{statusMessage}</div>

    <input
        id="slider"
        type="range"
        min="1"
        max={sliderMax}
        bind:value={sliderBytes}
        oninput={updateImage}
    />

</div>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
{#if currentObjectURL}
    <img
        id="img"
        class:expanded={expand}
        src={currentObjectURL}
        alt="can I have more bytes, please?"
        title="Click to expand"
        onclick={() => expand = !expand}
        onload={onImageLoad}
    />
{/if}

<style lang="scss">
    img {
        max-height: 100vh;
        max-width: 100vw;
    }

    img.expanded {
        max-height: unset;
        max-width: unset;
    }
</style>
