export const errors = {
  DB_OPEN_FAILED: ({ details }) => ({
    title: "Database error",
    message:
      "Failed to open database, you can still create and import new flows, but it won't be saved !\nAny changes made will be lost when closing vAP.",
    details,
  }),
  DB_CLOSED: ({ details }) => ({
    title: "Database error",
    message: "Database closed unexpectedly, this might happen when site data was cleared.",
    details,
  }),
};
