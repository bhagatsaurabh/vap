import { createAsyncThunk } from "@reduxjs/toolkit";
import store from "..";

const getNavData = createAsyncThunk("navigation/fetch", async () => {
  return store.getState().navigation;
});

export { getNavData };
