import { createAction, createReducer } from "@reduxjs/toolkit";
import { getSamples } from "../actions/samples";

const setSamples = createAction("samples/set");

const reducer = createReducer([], (builder) => {
  builder
    .addCase(setSamples, (_state, action) => {
      if (action.payload) return [...action.payload];
      return [];
    })
    .addCase(getSamples.fulfilled, (_state, action) => {
      if (action.payload) return [...action.payload];
      return [];
    })
    .addDefaultCase(() => {});
});

export default reducer;
