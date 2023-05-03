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

export { openDatabase, closeDatabase, getPreviews };
