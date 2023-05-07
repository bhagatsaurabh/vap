import { createAsyncThunk } from "@reduxjs/toolkit";

const getTemplates = createAsyncThunk("templates/fetch", async (_, { dispatch }) => {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/saurabh-prosoft/vap/templates/templates/templates.json"
    );
    return await response.json();
  } catch {
    dispatch({
      type: "toast/set",
      payload: { type: "error", message: "Failed to fetch templates" },
    });
  }
});

const getTemplate = createAsyncThunk("templates/fetch-one", async (url, { dispatch }) => {
  try {
    const response = await fetch(url);
    return await response.blob();
  } catch {
    dispatch({
      type: "toast/set",
      payload: { type: "error", message: "Failed to download template" },
    });
    return null;
  }
});

export { getTemplates, getTemplate };
