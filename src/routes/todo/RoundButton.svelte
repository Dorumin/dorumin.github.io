<script lang="ts">
    import Icon from '$lib/components/Icon.svelte';

    const { onclick } = $props();
</script>

<button type="button" class="round-button" {onclick}>
    <Icon type="solid" name="arrow-left" />
</button>

<style lang="scss">
    .round-button {
        appearance: none;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        position: absolute;
        bottom: 24px;
        right: 24px;
        color: white;
        background-color: #0dd;
        border: none;
        box-shadow: 0 0 5px black;
        outline: none;
        transition: transform 150ms ease, background-color 150ms ease;
        transform: translateY(0);
    }

    .round-button:hover {
        transform: translateY(-4px);
        background-color: #00eded;
    }
</style>
