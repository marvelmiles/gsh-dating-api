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
  .post("/signin", signin)
  .patch("/signout", verifyJWToken, signout)
  .post("/user-exists", userExists)
  .post("/recover-password", findUser, recoverPwd)
  .post("/reset-password/:userId", resetPwd)
  .post("/generate-new-token/:userId/:reason", findUser, generateUserToken)
  .post("/verify-token/:reason", findUser, verifyUserToken)
  .get("/refresh-token", refreshTokens);

export default authRouter;
