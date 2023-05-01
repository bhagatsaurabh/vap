import { openDatabase } from "@/misc/db";
import { createAsyncThunk } from "@reduxjs/toolkit";

const initDatabase = createAsyncThunk("db/init", async () => {
  return await openDatabase();
});

export { initDatabase };
