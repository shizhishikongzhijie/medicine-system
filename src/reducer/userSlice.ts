'use client'
import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice({
    name: 'counter',
    initialState: {
        role_id: 0,
        uid: 0,
        username: '',
        iat: 0,
        exp: 0
    },
    reducers: {
        updateUserData(state, action) {
            state.uid = action.payload.uid
            state.role_id = action.payload.role_id
            state.username = action.payload.username
            state.iat = action.payload.iat
            state.exp = action.payload.exp
        }
    }
})

export const { updateUserData } = userSlice.actions

export default userSlice.reducer
