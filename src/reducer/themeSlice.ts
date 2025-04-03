"use client"
import {createSlice} from '@reduxjs/toolkit'

export const themeSlice = createSlice({
    name: 'counter',
    initialState: {
        value: 'light',
    },
    reducers: {
        setTheme(state, action) {
            state.value = action.payload.theme
        },
    }
})

export const {setTheme} = themeSlice.actions

export default themeSlice.reducer