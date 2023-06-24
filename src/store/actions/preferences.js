import { createAsyncThunk } from "@reduxjs/toolkit";

const loadPreferences = createAsyncThunk("preferences/load", async () => {
  return JSON.parse(localStorage.getItem("preference")) ?? {};
});

export { loadPreferences };
