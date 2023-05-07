import { createAsyncThunk } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";

import { deleteFlow, getFlow, getPreviews, openDatabase, putFlow } from "@/misc/db";

const initDatabase = createAsyncThunk("db/init", async (_, { dispatch }) => {
  dispatch({ type: "database/clear-error" });
  return await openDatabase(dispatch);
});

const fetchPreviews = createAsyncThunk("db/previews", async (_, { dispatch, getState }) => {
  dispatch({ type: "database/clear-error" });

  try {
    const state = getState();
    state.database.previews.forEach((preview) => URL.revokeObjectURL(preview.img));

    let previews = await getPreviews();
    previews = previews.map((preview) => ({
      ...preview,
      img: preview.img && URL.createObjectURL(preview.img),
    }));
    dispatch({ type: "database/dirty", payload: false });

    return previews;
  } catch (error) {
    dispatch({
      type: "toast/set",
      payload: { type: "error", message: "Failed to load flows" },
    });
    return [];
  }
});

const saveFlow = createAsyncThunk("db/save-flow", async ({ id, flow }, { dispatch }) => {
  dispatch({ type: "database/clear-error" });
  try {
    let flowId = id;
    if (!flowId) flowId = uuid();

    await putFlow(flowId, flow);
    dispatch({ type: "database/dirty", payload: true });
    return flowId;
  } catch (error) {
    console.log(error);
    dispatch({
      type: "toast/set",
      payload: { type: "error", message: "Failed to save/create flow" },
    });
    return null;
  }
});

const fetchFlow = createAsyncThunk("db/flow", async (id, { dispatch }) => {
  dispatch({ type: "database/clear-error" });
  try {
    return await getFlow(id);
  } catch (error) {
    dispatch({
      type: "toast/set",
      payload: { type: "error", message: "Failed to load flow" },
    });
    return null;
  }
});

const removeFlow = createAsyncThunk("db/remove-flow", async ({ id, name }, { dispatch }) => {
  dispatch({ type: "database/clear-error" });
  try {
    await deleteFlow(id);
    dispatch({ type: "database/dirty", payload: true });
    dispatch({
      type: "toast/set",
      payload: { type: "success", message: `Flow ${name} successfully deleted` },
    });
  } catch (error) {
    dispatch({
      type: "toast/set",
      payload: { type: "error", message: "Failed to delete flow" },
    });
    return null;
  }
});

export { initDatabase, fetchPreviews, saveFlow, fetchFlow, removeFlow };
