import {
  HTTP_CODE_INVALID_USER_ACCOUNT,
  HTTP_MSG_INVALID_USER_ACCOUNT,
} from "../config/constants";
import User from "../models/User";
import { getAll } from "../utils";
import { createError } from "../utils/error";
import { deleteFile } from "../utils/file-handlers";
import { createSuccessBody } from "../utils/normalizers";
import { createSearchQuery } from "../utils/serializers";

export const updateUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const { firstname, username, lastname, bio, settings, email } = req.body;

    let user = await User.findById(userId);

    if (!user)
      throw createError(
        HTTP_MSG_INVALID_USER_ACCOUNT,
        400,
        HTTP_CODE_INVALID_USER_ACCOUNT
      );

    let oldPhotoUrl;

    let newPhotoUrl = user.photoUrl;

    if (req.file?.publicUrl) {
      oldPhotoUrl = user.photoUrl;
      newPhotoUrl = req.file.publicUrl;
    }

    user = await User.findByIdAndUpdate(
      userId,
      {
        bio,
        settings,
        username,
        lastname,
        firstname,
        email,
        photoUrl: newPhotoUrl,
      },
      { new: true }
    );

    res.json(createSuccessBody(user, "Profile updated successfully!"));

    oldPhotoUrl && deleteFile(photoUrl);
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    res.json(
      createSuccessBody(await getAll(User, req.query, createSearchQuery()))
    );
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    res.json(createSuccessBody(await User.findById(req.params.userId)));
  } catch (err) {
    next(err);
  }
};
