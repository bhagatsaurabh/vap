export const errors = {
  DB_OPEN_FAILED: ({ details }) => ({
    title: "Database error",
    message:
      "Failed to open database, you can still create and import new flows, but it won't be saved !\nAny changes you make will be lost when closing vAP.",
    details,
  }),
};
