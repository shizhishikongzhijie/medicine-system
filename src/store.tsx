
// store.tsx
"use client";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from "@/reducer/userSlice"
import themeReducer from "@/reducer/themeSlice"
import { Provider } from "react-redux";
import React from "react";

const rootReducer = combineReducers({
    user: userReducer,
    theme:themeReducer
});


export const store = configureStore({
    reducer: rootReducer
});

// 创建持久化 store

export function ReduxProvider({children}: { children: React.ReactNode }) {
    return (
        <Provider store={store}>{children}</Provider>
    );
}

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;