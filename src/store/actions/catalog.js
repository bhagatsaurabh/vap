import { createAsyncThunk } from "@reduxjs/toolkit";

const getCatalog = createAsyncThunk("catalog/fetch", async (_, { dispatch }) => {
  try {
    const response = await fetch("/catalog.json");
    return await response.json();
  } catch {
    dispatch({
      type: "toast/set",
      payload: { type: "error", message: "Failed to fetch library catalog" },
    });
  }
});

export { getCatalog };
