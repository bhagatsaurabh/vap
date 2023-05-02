import { combineReducers, configureStore } from "@reduxjs/toolkit";

import media from "./reducers/media";
import database from "./reducers/database";

const rootReducer = combineReducers({
  media,
  database,
});

export default configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});
