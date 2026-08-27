import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import {
  errHandler,
  validateCors,
  queryTypeHandler,
  selectDatabase,
} from "./utils/middlewares";
import authRouter from "./routers/auth";
import miscRouter from "./routers/misc";
import userRouter from "./routers/user";
import docsRouter from "./routers/docs";
import { serverPort } from "./config/env";

const app = express();

app.set("trust proxy", 1);

app.use("/docs", docsRouter);

app
  .use(cookieParser())
  .use(cors(validateCors))
  .use(selectDatabase)
  .use(
    express.json({
      limit: "200mb",
      extended: true,
    })
  )
  .use(express.urlencoded({ extended: true }))
  .use(queryTypeHandler)
  .use(express.static("public"));

app
  .use("/api/auth", authRouter)
  .use("/api/users", userRouter)
  .use("/api", miscRouter)
  .use(errHandler);

app.listen(serverPort, () => {
  console.log(`Server started on port ${serverPort}`);
  console.log(`API reference available at http://localhost:${serverPort}/docs`);
});
