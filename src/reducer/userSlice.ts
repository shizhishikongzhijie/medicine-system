"use client";
import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "counter",
  initialState: {
    coinCount: 40,
    experience: 22200,
    fansCount: 0,
    followCount: 2,
    isBan: 0,
    isFansVisible: 0,
    isFollowVisible: 0,
    profileImagePath:
      "https://e-esine.cn/img/IMG_3240.JPG!/min/180/clip/180x180a0a0",
    registerTime: "2024-11-13 18:28:33",
    uid: 100000001,
    userSignature: "这个人很懒，什么都没有写",
    username: "E-esinE",
  },
  reducers: {
    updateUserData(state, action) {
      state.coinCount = action.payload.coinCount;
      state.experience = action.payload.experience;
      state.fansCount = action.payload.fansCount;
      state.followCount = action.payload.followCount;
      state.isBan = action.payload.isBan;
      state.isFansVisible = action.payload.isFansVisible;
      state.isFollowVisible = action.payload.isFollowVisible;
      state.profileImagePath = action.payload.profileImagePath;
      state.registerTime = action.payload.registerTime;
      state.uid = action.payload.uid;
      state.userSignature = action.payload.userSignature;
      state.username = action.payload.username;
    },
  },
});

export const { updateUserData } = userSlice.actions;

export default userSlice.reducer;
