import dotenv from "dotenv";

dotenv.config();

// export const isProductionEnvironment = true;

export const isProductionEnvironment =
  process.env.NODE_ENV === "production" ||
  process.env.ENVIRONMENT === "production";

export const serverPort = Number(process.env.PORT) || 10000;
