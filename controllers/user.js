import User from "../models/User";
import { getAll } from "../utils";
import { deleteFile } from "../utils/file-handlers";
import { createSuccessBody, safeParseJSON } from "../utils/normalizers";
import { createSearchQuery } from "../utils/serializers";
import { appendUserKeyValue } from "../utils/user";
import { isObject } from "../utils/validators";

export const getUserById = async (req, res, next) => {
  try {
    res.json(createSuccessBody(await User.findById(req.params.userId)));
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    res.json(
      createSuccessBody(
        await getAll(User, req.query, createSearchQuery(req.query))
      )
    );
  } catch (err) {
    next(err);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const { firstname, username, lastname, deleteAvatar, photoUrl } = req.body;

    let user = req.user;

    let oldPhotoUrl;

    let newPhotoUrl = photoUrl || user.photoUrl;

    if (req.file?.publicUrl) {
      oldPhotoUrl = user.photoUrl;
      newPhotoUrl = req.file.publicUrl;
    }

    if (username && (await User.find({ username })))
      throw `Invalid request: The username "${username}" is already in use. Please choose a new username.`;

    const update = {
      username,
      lastname,
      firstname,
      photoUrl: newPhotoUrl,
    };

    appendUserKeyValue(req.body, update);

    if (deleteAvatar) {
      await deleteFile(user.photoUrl);

      req.file && (await deleteFile(req.file.publicUrl));

      oldPhotoUrl = undefined;
      update.photoUrl = "";
    }

    user = await User.findByIdAndUpdate(userId, update, { new: true });

    res.json(createSuccessBody(user, "Profile updated successfully!"));

    oldPhotoUrl && deleteFile(oldPhotoUrl);
  } catch (err) {
    next(err);
  }
};

export const updateProfileCover = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const updateIndex =
      (req.body.updateIndex
        ? safeParseJSON(req.body.updateIndex, "updateIndex")
        : null) || req.query.updateIndex;

    const delIndex =
      (req.body.delIndex
        ? safeParseJSON(req.body.delIndex, "delIndex")
        : null) || req.query.delIndex;

    if (req.files ? false : !delIndex)
      throw "Invalid request: Empty upload or No modification rule.";

    let user = req.user;

    let oldCovers = user.profileCover.slice();

    let delUrl = [];

    const strictMode =
      typeof req.query.strictMode === "boolean" ? req.query.strictMode : true;

    if (delIndex) {
      if (!Array.isArray(delIndex))
        throw "Invalid request. Expected delIndex to be of type array.";

      for (let index of delIndex) {
        index = Number(index);

        if (isNaN(index)) throw `Invalid delete index ${index}`;

        const file = oldCovers.splice(index, 1)[0];

        file && delUrl.push(file.url);
      }
    }

    if (updateIndex) {
      if (!isObject(updateIndex))
        throw "Invalid request. Expected updateIndex to be of type Object.";

      for (let index in updateIndex) {
        index = Number(index);

        const filePos = Number(updateIndex[index]);

        if (isNaN(index) || isNaN(filePos))
          throw `Invalid update index key value pair should be of type integer ${index}`;

        const file = req.files[filePos];

        const getMediaProp = (file) => ({
          mimetype: file.mimetype,
          size: file.size,
          url: file.publicUrl,
        });

        if (file?.publicUrl) {
          const oldMedia = oldCovers[index];

          if (strictMode && index && !oldMedia)
            throw `Invalid request: Update index ${index} exceeds profile cover size of ${oldCovers.length}`;

          if (oldMedia) delUrl.push(oldMedia.url);

          oldCovers[index] = getMediaProp(file);
        }
      }
    } else if (req.files.length) {
      delUrl = oldCovers.map((media) => media.url);

      oldCovers = req.files.map((file) => getMediaProp(file));
    }

    user = await User.findByIdAndUpdate(
      userId,
      {
        profileCover: oldCovers,
      },
      { new: true }
    );

    res.json(createSuccessBody(user));

    for (const url of delUrl) {
      deleteFile(url);
    }
  } catch (err) {
    next(err);
  }
};
