<script lang="ts">
    import './global.css';
    import '../fa/css/all.css';
</script>

<div class="app">
    <main>
        <slot></slot>
    </main>
</div>

<style lang="scss">
    .app {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: #181818;
        color: #eee;
    }

    main {
        height: 100%;
        overflow: auto;
    }
</style>
