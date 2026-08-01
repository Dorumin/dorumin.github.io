<script lang="ts">
    import { browser } from '$app/environment';

    type PromptEvent = Event & {
        prompt(): Promise<void>;
    };

    let installPrompt: PromptEvent | null = null;

    if (browser) {
        window.addEventListener('beforeinstallprompt', (event) => {
            event.preventDefault();
            installPrompt = event as PromptEvent;
        });
    }

    async function install() {
        if (installPrompt) {
            await installPrompt.prompt();
        }
    }
</script>

{#if installPrompt}
    <button onclick={install}>install me install me install me install me install me</button>
{/if}
