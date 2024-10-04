import mongoose from "mongoose";

const connections = {};

export const connectToDatabase = async (isBreeze) => {
  const conKey = isBreeze ? "breeze" : "soulmater";

  if (connections[conKey]) return connections[conKey];

  // Establish a new connection
  const connection = await mongoose.connect(
    process.env[isBreeze ? "MONGODB_PROD_URI" : "MONGODB_PROD_TEST_URI"],
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );

  connections[conKey] = connection;

  return connection;
};
