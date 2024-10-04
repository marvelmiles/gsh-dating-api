import mongoose from "mongoose";
import { isProdMode } from "./constants";

const connections = {};

export const connectToDatabase = (isBreeze) => {
  const conKey = isBreeze ? "breeze" : "soulmater";

  if (connections[conKey]) return connections[conKey];

  // Establish a new connection
  const connection = mongoose.createConnection(
    process.env[
      isProdMode
        ? isBreeze
          ? "MONGODB_PROD_URI"
          : "MONGODB_PROD_TEST_URI"
        : isBreeze
        ? "MONGODB_DEV_URI"
        : "MONGODB_DEV_TEST_URI"
    ]
  );

  connections[conKey] = connection;

  return connection;
};
