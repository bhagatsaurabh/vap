import { createAction, createReducer } from "@reduxjs/toolkit";

const set = createAction("media/set");

const reducer = createReducer({ value: "mobile" }, (builder) => {
  builder
    .addCase(set, (state, action) => {
      if (!action.payload) {
        if (matchMedia("(min-width: 1024px)").matches) {
          state.value = "desktop";
        } else if (matchMedia("(min-width: 768px)").matches) {
          state.value = "tab";
        } else {
          state.value = "mobile";
        }
      } else {
        state.value = action.payload;
      }
    })
    .addDefaultCase(() => {});
});

export default reducer;
