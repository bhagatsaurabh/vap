import { createAsyncThunk } from "@reduxjs/toolkit";

const getSamples = createAsyncThunk("samples/fetch", async (_, { dispatch }) => {
  try {
    const response = await fetch("/samples.json");
    return await response.json();
  } catch {
    dispatch({
      type: "toast/set",
      payload: { type: "error", message: "Failed to fetch audio samples information" },
    });
  }
});

export { getSamples };
