import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import undoable from 'redux-undo';

interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

interface TodosState {
    todos: Todo[];
}

const initialState: TodosState = {
    todos: [],
};

const todosSlice = createSlice({
    name: 'todos',
    initialState,
    reducers: {
        addTodo: (state, action: PayloadAction<string>) => {
            const newTodo: Todo = {
                id: state.todos.length + 1,
                text: action.payload,
                completed: false,
            };
            state.todos.push(newTodo);

            console.log(state.todos);
        },
        toggleTodo: (state, action: PayloadAction<number>) => {
            const todo = state.todos.find(todo => todo.id === action.payload);
            if (todo) {
                todo.completed = !todo.completed;
            }
        },
        removeTodo: (state, action: PayloadAction<number>) => {
            state.todos = state.todos.filter(todo => todo.id !== action.payload);
        },
    },
});

export const { addTodo, toggleTodo, removeTodo } = todosSlice.actions;

export default undoable(todosSlice.reducer);
