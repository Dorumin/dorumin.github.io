import { combineReducers, configureStore } from '@reduxjs/toolkit';
import counter from './counter';
import todos from './todos';
import { derived, type Readable } from 'svelte/store';

const root = configureStore({
    reducer: combineReducers({
        counter,
        todos
    }),
});

type RootState = ReturnType<typeof root.getState>;

const store = derived([root as unknown as Readable<RootState>], () => {
    return root.getState();
}, undefined as unknown as RootState);

export const dispatch = root.dispatch;

export default store;
