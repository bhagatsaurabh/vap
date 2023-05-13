import { createAction, createReducer } from "@reduxjs/toolkit";

const setPrev = createAction("navigation/set-prev");

const reducer = createReducer({ prev: null }, (builder) => {
  builder
    .addCase(setPrev, (state, action) => {
      state.prev = action.payload;
    })
    .addDefaultCase(() => {});
});

export default reducer;
