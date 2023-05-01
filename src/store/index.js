import { combineReducers, configureStore } from "@reduxjs/toolkit";

import media from "./reducers/media";

const rootReducer = combineReducers({
  media,
});

export default configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});
