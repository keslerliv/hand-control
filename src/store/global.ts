import { createSlice } from "@reduxjs/toolkit";
import { initialProps } from "./types";

const initialState: initialProps = {
  number: 0,
  zoom: 0,
  horizontalRotation: 0,
  verticalRotation: 0,
};

export const global = createSlice({
  name: "global",
  initialState,
  reducers: {
    setNumber: (state, { payload }) => {
      state.number = payload;
    },
    applyZoom: (state, { payload }) => {
      state.zoom = payload;
    },
    setHorizontalRotation: (state, { payload }) => {
      state.horizontalRotation = payload;
    },
    setVerticalRotation: (state, { payload }) => {
      state.verticalRotation = payload;
    },
  },
});

export const {
  setNumber,
  applyZoom,
  setHorizontalRotation,
  setVerticalRotation,
} = global.actions;

export default global.reducer;
