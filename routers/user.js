import express from "express";
import { findUser, verifyJWToken } from "../utils/middlewares";
import { uploadFile } from "../utils/file-handlers";
import {
  getAllUsers,
  getUserById,
  updateProfileCover,
  updateUserById,
} from "../controllers/user";

const userRouter = express.Router();

userRouter
  .get("/:userId", getUserById)
  .get("/", getAllUsers)
  .put(
    "/update-profile-cover/:userId",
    verifyJWToken,
    findUser,
    uploadFile({
      name: "profile-cover",
      dirPath: "profile-covers",
      type: "medias",
      single: false,
      maxCount: 5,
    }),
    updateProfileCover
  )
  .put("/:userId", verifyJWToken, findUser, uploadFile(), updateUserById);

export default userRouter;
