import { createAsyncThunk } from "@reduxjs/toolkit";

const getDocs = createAsyncThunk("docs/fetch", async (url, { dispatch }) => {
  try {
    const response = await fetch(url);
    return await response.text();
  } catch {
    dispatch({
      type: "toast/set",
      payload: { type: "error", message: "Failed to fetch docs" },
    });
    return null;
  }
});

export { getDocs };
