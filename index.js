import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import queryType from "query-types";
import { isProdMode } from "./utils/validators";
import { console500MSG } from "./utils/error";
import { errHandler, validateCors } from "./utils/middlewares";
import authRouter from "./routers/auth";
import miscRouter from "./routers/misc";
import userRouter from "./routers/user";

// CONFIGURATIONS

dotenv.config();

const app = express();

// MIDDLEWARES

app
  .use(cookieParser())
  .use(cors(validateCors))
  .use(
    express.json({
      limit: "200mb",
      extended: true,
    })
  )
  .use(express.urlencoded({ extended: true }))
  .use(queryType.middleware())
  .use(express.static("public"));

// ROUTES

app
  .use("/api/auth", authRouter)
  .use("/api/users", userRouter)
  .use("/api/misc", miscRouter)
  .use(errHandler);

// MONGOOSE SETUP

mongoose
  .connect(process.env[isProdMode ? "MONGODB_PROD_URI" : "MONGODB_DEV_URI"])
  .then(() => {
    app.listen(process.env.PORT || 8080, (_) =>
      console.log("Server started..")
    );
  })
  .catch(console500MSG);
