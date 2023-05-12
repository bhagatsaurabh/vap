import { combineReducers, configureStore } from "@reduxjs/toolkit";

import media from "./reducers/media";
import database from "./reducers/database";
import toast from "./reducers/toast";
import templates from "./reducers/templates";
import catalog from "./reducers/catalog";

const rootReducer = combineReducers({
  media,
  database,
  toast,
  templates,
  catalog,
});

export default configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});
