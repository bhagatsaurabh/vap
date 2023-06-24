import { combineReducers, configureStore } from "@reduxjs/toolkit";

import media from "./reducers/media";
import database from "./reducers/database";
import toast from "./reducers/toast";
import templates from "./reducers/templates";
import catalog from "./reducers/catalog";
import navigation from "./reducers/navigation";
import preferences from "./reducers/preferences";
import tour from "./reducers/tour";
import samples from "./reducers/samples";

const rootReducer = combineReducers({
  media,
  database,
  toast,
  templates,
  catalog,
  navigation,
  preferences,
  tour,
  samples,
});

export default configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});
