import mongoose from "mongoose";
import { isProdMode } from "./constants";
import { userSchema } from "../models/User";
import { console500MSG } from "../utils/error";

const connections = {};
const dbModels = {};

export const connectToDatabase = (
  options = {
    isBreeze: false,
    isProd: false,
  },
) => {
  const { isBreeze = false, isProd = isProdMode } = options;

  const conKey = isBreeze ? "breeze" : "soulmater";

  let db, models;

  if (connections[conKey]) {
    db = connections[conKey];
    models = dbModels[conKey];
  } else {
    const connection = mongoose.createConnection(
      process.env[
        isProd
          ? isBreeze
            ? "MONGODB_PROD_URI"
            : "MONGODB_PROD_TEST_URI"
          : isBreeze
            ? "MONGODB_DEV_URI"
            : "MONGODB_DEV_TEST_URI"
      ],
      { serverSelectionTimeoutMS: 60000, connectTimeoutMS: 30000 },
    );

    connections[conKey] = connection;

    dbModels[conKey] = {
      User: connection.model("User", userSchema),
    };

    db = connection;
    models = dbModels[conKey];

    db.on("error", (err) => {
      console500MSG(err, "DATABASE_CONNECTION");
    });
  }

  return { db, models };
};
