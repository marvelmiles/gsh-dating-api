import mongoose from "mongoose";
import { isProdMode } from "./constants";
import { userSchema } from "../models/User";

const connections = {};
const dbModels = {};

export const connectToDatabase = (isBreeze) => {
  const conKey = isBreeze ? "breeze" : "soulmater";

  let db, models;

  if (connections[conKey]) {
    db = connections[conKey];
    models = dbModels[conKey];
  } else {
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

    dbModels[conKey] = {
      User: connection.model("User", userSchema),
    };

    db = connection;
    models = dbModels[conKey];
  }

  return { db, models };
};
