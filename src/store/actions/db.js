import { openDatabase } from "@/misc/db";
import { createAsyncThunk } from "@reduxjs/toolkit";

const initDatabase = createAsyncThunk("db/init", async (_, { dispatch }) => {
  dispatch({ type: "database/clear-error" });
  return await openDatabase();
});

export { initDatabase };
