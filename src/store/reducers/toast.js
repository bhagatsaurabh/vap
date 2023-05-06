import { createAction, createReducer } from "@reduxjs/toolkit";

const toastSet = createAction("toast/set");
const toastClear = createAction("toast/clear");

const reducer = createReducer({ data: null }, (builder) => {
  builder
    .addCase(toastSet, (state, action) => {
      state.data = action.payload;
    })
    .addCase(toastClear, (state) => {
      state.data = null;
    })
    .addDefaultCase(() => {});
});

export default reducer;
