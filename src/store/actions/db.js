import { createAsyncThunk } from "@reduxjs/toolkit";

import { getPreviews, openDatabase } from "@/misc/db";

const initDatabase = createAsyncThunk("db/init", async (_, { dispatch }) => {
  dispatch({ type: "database/clear-error" });
  return await openDatabase(dispatch);
});

const fetchPreviews = createAsyncThunk("db/previews", async (_, { dispatch }) => {
  dispatch({ type: "database/clear-error" });
  return await getPreviews();
});

export { initDatabase, fetchPreviews };
