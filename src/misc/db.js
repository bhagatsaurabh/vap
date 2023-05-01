let db = null;

const openDatabase = async () =>
  new Promise((resolve, reject) => {
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
      resolve(db);
    });
    request.addEventListener("success", (e) => {
      const database = e.target.result;
      db = database;
      resolve(db);
    });
    request.addEventListener("error", (e) => {
      reject(new Error(e.target.errorCode));
    });
    request.addEventListener("blocked", (e) => {
      reject(new Error(e.target.errorCode));
    });
  });

const closeDatabase = () => {
  db?.close();
};

export { openDatabase, closeDatabase };
