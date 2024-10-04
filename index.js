import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { console500MSG } from "./utils/error";
import {
  errHandler,
  validateCors,
  queryTypeHandler,
} from "./utils/middlewares";
import authRouter from "./routers/auth";
import miscRouter from "./routers/misc";
import userRouter from "./routers/user";
import { isProdMode } from "./config/constants";

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
  .use(queryTypeHandler)
  .use(express.static("public"));

// ROUTES

app
  .use("/api/auth", authRouter)
  .use("/api/users", userRouter)
  .use("/api", miscRouter)
  .use(errHandler);

// MONGOOSE SETUP

const port = process.env.PORT || 10000;

app.listen(port, (_) => console.log(`Server started on port ${port}..`));
