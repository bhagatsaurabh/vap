import { createAction, createReducer } from "@reduxjs/toolkit";

const setTourState = createAction("tour/set-state");

const reducer = createReducer({ status: null }, (builder) => {
  builder
    .addCase(setTourState, (state, action) => {
      return { ...state, status: action.payload };
    })
    .addDefaultCase(() => {});
});

export default reducer;
