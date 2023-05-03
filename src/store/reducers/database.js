import { createAction, createReducer } from "@reduxjs/toolkit";

import { initDatabase } from "../actions/db";
import { errors } from "@/misc/errors";

const setStatus = createAction("database/status");
const setError = createAction("database/error");
const clearError = createAction("database/clear-error");

const initialState = {
  status: null,
  error: null,
  previews: [],
};

const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setStatus, (state, action) => {
      state.status = action.payload;
    })
    .addCase(setError, (state, action) => {
      state.error = action.payload;
    })
    .addCase(clearError, (state) => {
      state.error = null;
    })
    .addCase(initDatabase.fulfilled, (state) => {
      state.status = "open";
    })
    .addCase(initDatabase.rejected, (state, action) => {
      state.error = errors.DB_OPEN_FAILED({ details: action.error.message });
      state.status = null;
    })
    .addDefaultCase(() => {});
});

export default reducer;
