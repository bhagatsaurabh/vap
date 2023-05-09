import { errors } from "./errors";
import { noop } from "./utils";

let db = null;
let dispatch = noop;

const openDatabase = async (storeDispatch) => {
  dispatch = storeDispatch;
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("vapdb", 1);

    request.addEventListener("upgradeneeded", (e) => {
      const database = e.target.result;

      if (!database.objectStoreNames.contains("previews")) {
        database.createObjectStore("previews");
      }
      if (!database.objectStoreNames.contains("flows")) {
        database.createObjectStore("flows");
      }
      db = database;
      db.addEventListener("close", closeListener);
      resolve(db);
    });
    request.addEventListener("success", (e) => {
      const database = e.target.result;
      db = database;
      db.addEventListener("close", closeListener);
      resolve(db);
    });
    request.addEventListener("error", (e) => {
      reject(e.target.error);
    });
    request.addEventListener("blocked", (e) => {
      reject(e.target.error);
    });
  });
};

const closeListener = (event) => {
  dispatch({ type: "database/status", payload: null });
  dispatch({
    type: "database/error",
    payload: errors.DB_CLOSED({ details: event.target?.error?.message ?? "Not Available" }),
  });
};

const closeDatabase = () => {
  db?.removeEventListener("close", closeListener);
  db?.close();
};

const getPreviews = async () =>
  new Promise((resolve, reject) => {
    if (!db) resolve([]);
    else {
      let request;
      try {
        request = db.transaction("previews").objectStore("previews").getAll();
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
        request.onerror = (event) => {
          reject(event.target.error);
        };
      } catch (error) {
        reject(error);
      }
    }
  });

const putPreview = async (id, preview) => {
  return new Promise((resolve, reject) => {
    try {
      const request = db
        .transaction("previews", "readwrite")
        .objectStore("previews")
        .put(preview, id);
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = (event) => {
        reject(event.target.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

const putFlow = async (id, flow, preview) => {
  let img = null;
  if (preview.img) {
    img = await (await fetch(preview.img)).blob();
  }
  await putPreview(id, { id, name: preview.name, img });

  if (flow) {
    flow = await (await fetch(flow)).blob();
  }

  return new Promise((resolve, reject) => {
    try {
      const request = db.transaction("flows", "readwrite").objectStore("flows").put(flow, id);
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = (event) => {
        reject(event.target.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

const getFlow = async (id) => {
  return new Promise((resolve, reject) => {
    try {
      const request = db.transaction("flows").objectStore("flows").get(id);
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      request.onerror = (event) => {
        reject(event.target.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

const deleteFlow = async (id) => {
  return new Promise((resolve, reject) => {
    try {
      let pRequest = db.transaction("previews", "readwrite").objectStore("previews").delete(id);
      pRequest.onsuccess = () => {
        let fRequest = db.transaction("flows", "readwrite").objectStore("flows").delete(id);
        fRequest.onsuccess = () => resolve();
        fRequest.onerror = (event) => {
          reject(event.target.error);
        };
      };
      pRequest.onerror = (event) => {
        reject(event.target.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export { openDatabase, closeDatabase, getPreviews, putPreview, putFlow, getFlow, deleteFlow };
