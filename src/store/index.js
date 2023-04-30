import { combineReducers, configureStore } from "@reduxjs/toolkit";

import media from "./reducers/media";

const rootReducer = combineReducers({
  media,
});

export default configureStore({ reducer: rootReducer });
