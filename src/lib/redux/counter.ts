import { createSlice } from '@reduxjs/toolkit';
import undoable from 'redux-undo';

const counterSlice = createSlice({
    name: 'counter',
    initialState: 0,
    reducers: {
        increment(state) {
            return state + 1;
        },
        decrement(state) {
            return state - 1;
        },
    },
});

export const { increment, decrement } = counterSlice.actions;

export default undoable(counterSlice.reducer);
