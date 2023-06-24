import { createAction, createReducer } from "@reduxjs/toolkit";
import { loadPreferences } from "../actions/preferences";

const setPreference = createAction("preference/set");

const reducer = createReducer({}, (builder) => {
  builder
    .addCase(loadPreferences.fulfilled, (_state, action) => {
      return action.payload;
    })
    .addCase(setPreference, (state, action) => {
      if (action.payload) {
        const newState = { ...state, ...action.payload };
        localStorage.setItem("preference", JSON.stringify(newState));
        return newState;
      }
      return state;
    })
    .addDefaultCase(() => {});
});

export default reducer;
