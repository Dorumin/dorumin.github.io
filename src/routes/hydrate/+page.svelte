<script lang="ts">
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';

    const { data } = $props();

    let a = $state(null as unknown);
    let count = $state(0);
    let clientAt = $state(new Date());

    if (browser) {
        count += 1;
        clientAt = new Date();
    }

    onMount(() => {
        console.log(a);
    });

    console.log(data);
</script>

<p>this page has different state and dom post hydration</p>
<p bind:this={a}>hello {count}</p>

<pre>
server load ran at {data.serverAt.toISOString()}
server rendered at {data.serverAt.toISOString()}
client rendered at {clientAt?.toISOString()}
</pre>
