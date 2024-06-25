import express from "express";
import {
  generateUserToken,
  recoverPwd,
  refreshTokens,
  resetPwd,
  signin,
  signout,
  signup,
  userExists,
  verifyUserToken,
} from "../controllers/auth";
import { uploadFile } from "../utils/file-handlers";
import { findUser, verifyJWToken } from "../utils/middlewares";

const authRouter = express.Router();

authRouter
  .post("/signup", uploadFile(), signup)
  .post("/verify-token/:reason", findUser, verifyUserToken)
  .post("/generate-new-token/:reason", findUser, generateUserToken)
  .post("/signin", signin)
  .post("/recover-password", findUser, recoverPwd)
  .post("/reset-password", resetPwd)
  .get("/refresh-token", refreshTokens)
  .get("/user-exists/:userId", userExists)
  .patch("/signout", verifyJWToken, signout);

export default authRouter;
