import express from "express";
import { verifyJWToken } from "../utils/middlewares";
import { uploadFile } from "../utils/file-handlers";
import { getAllUsers, getUserById, updateUserById } from "../controllers/user";

const userRouter = express.Router();

userRouter
  .put("/:userId", verifyJWToken, uploadFile(), updateUserById)
  .get("/:userId", getUserById)
  .get("/", getAllUsers);

export default userRouter;
