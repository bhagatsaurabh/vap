import { createAction, createReducer } from "@reduxjs/toolkit";

const setPrev = createAction("navigation/set-prev");
const setModal = createAction("navigation/set-modal");
const clearModal = createAction("navigation/clear-modal");

const reducer = createReducer({ modal: null, prev: null }, (builder) => {
  builder
    .addCase(setPrev, (state, action) => {
      state.prev = action.payload;
    })
    .addCase(setModal, (state, action) => {
      state.modal = action.payload;
    })
    .addCase(clearModal, (state) => {
      state.modal = null;
    })
    .addDefaultCase(() => {});
});

export default reducer;
