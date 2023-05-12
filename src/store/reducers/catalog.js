import { createAction, createReducer } from "@reduxjs/toolkit";
import { getCatalog } from "../actions/catalog";

const setCatalog = createAction("catalog/set");

const reducer = createReducer([], (builder) => {
  builder
    .addCase(setCatalog, (_state, action) => {
      if (action.payload) return [...action.payload];
      return [];
    })
    .addCase(getCatalog.fulfilled, (_state, action) => {
      if (action.payload) return [...action.payload];
      return [];
    })
    .addDefaultCase(() => {});
});

export default reducer;
