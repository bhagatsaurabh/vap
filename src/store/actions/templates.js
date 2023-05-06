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

export { getTemplates };
