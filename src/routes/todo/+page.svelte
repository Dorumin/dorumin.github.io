<script lang="ts">
    import { ActionCreators } from 'redux-undo';
    import store, { dispatch } from '$lib/redux';
    import InstallBanner from './InstallBanner.svelte';
    import { addTodo, removeTodo, toggleTodo } from '$lib/redux/todos';
    import RoundButton from './RoundButton.svelte';
    import { quintOut } from 'svelte/easing';
    import { crossfade } from 'svelte/transition';
    import { flip } from 'svelte/animate';

    const [send, receive] = crossfade({
        fallback(node, _params) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;

            return {
                duration: 600,
                easing: quintOut,
                css: t => `
                    transform: ${transform} scale(${t});
                    opacity: ${t}
                `,
            };
        },
    });

    let todos = $derived($store.todos.present.todos);

    $effect(() => {
        console.log(todos);
    });

    function add(input: HTMLInputElement) {
        console.log(input);
        dispatch(addTodo(input.value));
        input.value = '';
    }
</script>

<InstallBanner />

<RoundButton onclick={() => dispatch(ActionCreators.undo())} />

<div class="board">
    <input
        class="new-todo"
        placeholder="add todo"
        onkeydown={event => event.key === 'Enter' && add(event.target as HTMLInputElement)}
    />

    <div class="left">
        <h2>todo</h2>
        {#each todos.filter(t => !t.completed) as todo (todo.id)}
            <label in:receive={{ key: todo.id }} out:send={{ key: todo.id }} animate:flip>
                <input type="checkbox" checked={todo.completed} oninput={() => dispatch(toggleTodo(todo.id))} />
                {todo.text}
                <button type="button" onclick={() => dispatch(removeTodo(todo.id))}>x</button>
            </label>
        {/each}
    </div>

    <div class="right">
        <h2>done</h2>
        {#each todos.filter(t => t.completed) as todo (todo.id)}
            <label in:receive={{ key: todo.id }} out:send={{ key: todo.id }} animate:flip>
                <input type="checkbox" checked={todo.completed} oninput={() => dispatch(toggleTodo(todo.id))} />
                {todo.text}
                <button type="button" onclick={() => dispatch(removeTodo(todo.id))}>x</button>
            </label>
        {/each}
    </div>
</div>

<style lang="scss">
    .new-todo {
        font-size: 1.4em;
        width: 100%;
        margin: 2em 0 1em 0;
    }

    .board {
        max-width: 36em;
        margin: 0 auto;
    }

    .left,
    .right {
        float: left;
        width: 50%;
        padding: 0 1em 0 0;
        box-sizing: border-box;
    }

    h2 {
        font-size: 2em;
        font-weight: 200;
        user-select: none;
    }

    label {
        top: 0;
        left: 0;
        display: block;
        font-size: 1em;
        line-height: 1;
        padding: 0.5em;
        margin: 0 auto 0.5em auto;
        border-radius: 2px;
        background-color: #eee;
        user-select: none;
        color: black;
    }

    input {
        margin: 0;
    }

    .right label {
        background-color: rgb(180, 240, 100);
    }

    button {
        float: right;
        height: 1em;
        box-sizing: border-box;
        padding: 0 0.5em;
        line-height: 1;
        background-color: transparent;
        border: none;
        color: rgb(170, 30, 30);
        opacity: 0;
        transition: opacity 0.2s;
    }

    label:hover button {
        opacity: 1;
    }
</style>
