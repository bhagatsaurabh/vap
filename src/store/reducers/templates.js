import { createAction, createReducer } from "@reduxjs/toolkit";
import { getTemplates } from "../actions/templates";

const templatesSet = createAction("templates/set");

const reducer = createReducer([], (builder) => {
  builder
    .addCase(templatesSet, (state, action) => {
      state.data = action.payload;
    })
    .addCase(getTemplates.fulfilled, (_, action) => {
      return action.payload;
    })
    .addDefaultCase(() => {});
});

export default reducer;
