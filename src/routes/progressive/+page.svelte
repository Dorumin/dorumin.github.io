<script lang="ts">
    import { deleteImage, putImage } from '$lib/progressive/idb';

    const IMG_ENDPOINT = '/progressive/img';

    type LoadingMode = 'blob' | 'network';

    let urlValue = $state('');
    let sliderBytes = $state(1);
    let sliderMax = $state(1);
    let statusMessage = $state('No image loaded.');
    let fixStaleProgressiveRenders = $state(true);
    let expand = $state(false);
    let loadingMode = $state('blob' as LoadingMode);

    let sourceBlob = $state(null as Blob | null);
    let currentSrc = $state(null as string | null);
    let objectUrlActive = $state(false);
    let activeBlobId = $state(null as string | null);

    let storeMemo: Promise<void> | null = null;

    function revokeObjectUrl() {
        if (objectUrlActive && currentSrc) {
            URL.revokeObjectURL(currentSrc);
            objectUrlActive = false;
        }
    }

    function setStatus(length: number, blob: Blob) {
        const percent = Math.round(length / blob.size * 100);
        const source = loadingMode === 'network' ? ' · via service worker' : '';
        statusMessage = `Bytes: ${length} / ${blob.size} (${percent}%)${source}`;
    }

    async function ensureServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            throw new Error('Service workers are not supported in this browser.');
        }

        await navigator.serviceWorker.register('/service-worker.js', {
            type: 'module',
        });
        await navigator.serviceWorker.ready;
    }

    function storeCurrentBlob() {
        if (!sourceBlob || !activeBlobId) return Promise.resolve();

        if (!storeMemo) {
            storeMemo = (async () => {
                await ensureServiceWorker();
                await putImage(activeBlobId, sourceBlob);
            })().finally(() => {
                storeMemo = null;
            });
        }

        return storeMemo;
    }

    async function updateImage() {
        if (!sourceBlob) return;

        const length = sliderBytes;

        if (loadingMode === 'blob') {
            revokeObjectUrl();
            const partialBlob = sourceBlob.slice(0, length, sourceBlob.type);
            currentSrc = URL.createObjectURL(partialBlob);
            objectUrlActive = true;
            setStatus(length, sourceBlob);
        } else {
            const id = activeBlobId;
            if (!id) return;

            try {
                await storeCurrentBlob();
                revokeObjectUrl();
                currentSrc = `${IMG_ENDPOINT}?id=${id}&length=${length}`;
                setStatus(length, sourceBlob);
            } catch (err) {
                console.log(err);
                console.error(err);
                statusMessage = `Failure. ${err}`;
            }
        }
    }

    function onModeChange() {
        if (!sourceBlob) return;
        void updateImage();
    }

    async function loadBlob(blob: Blob) {
        if (activeBlobId) {
            void deleteImage(activeBlobId);
        }

        sourceBlob = blob;
        activeBlobId = crypto.randomUUID();
        storeMemo = null;

        sliderMax = blob.size;
        sliderBytes = blob.size;

        await updateImage();
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

    <div class="modes">
        Loading mode
        <label title="Slice the blob in memory and show it instantly, no network involved">
            <input
                type="radio"
                name="mode"
                value="blob"
                bind:group={loadingMode}
                onchange={onModeChange}
            />
            Blob slice
        </label>
        <label title="Serve the partial bytes through a service worker that never finishes, emulating a forever network delay.\n\nThis is useful for formats that don't progressively decode when fully loaded, such as webp or avif.">
            <input
                type="radio"
                name="mode"
                value="network"
                bind:group={loadingMode}
                onchange={onModeChange}
            />
            Service worker
        </label>
    </div>

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
{#if currentSrc}
    {#key (loadingMode === 'blob' ? 'blob' : currentSrc)}
        <img
            id="img"
            class:expanded={expand}
            src={currentSrc}
            alt="can I have more bytes, please?"
            title="Click to expand"
            onclick={() => expand = !expand}
            onload={onImageLoad}
        />
    {/key}
{/if}

<style lang="scss">
    .modes {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .modes label {
        display: inline-flex;
        align-items: center;
        gap: 4px;
    }

    img {
        max-height: 100vh;
        max-width: 100vw;
    }

    img.expanded {
        max-height: unset;
        max-width: unset;
    }
</style>
