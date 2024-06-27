import User from "../models/User";
import { getAll } from "../utils";
import { deleteFile } from "../utils/file-handlers";
import { createSuccessBody } from "../utils/normalizers";
import { createSearchQuery } from "../utils/serializers";
import { appendUserKeyValue } from "../utils/user";

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

    if (!req.files?.length) throw "Invalid request: Empty upload";

    let user = req.user;

    let oldCovers = user.profileCover.slice();

    const rules = req.body.rules || req.query.rules;

    let delUrl = [];

    if (rules) {
      const { delIndex, updateIndex } = rules;

      for (const index of delIndex) {
        const url = oldCovers.splice(index, 1)[0];

        url && delUrl.push(url);
      }

      for (const index of updateIndex) {
        const file = req.files[index];

        const url = file?.publicUrl;

        if (url) {
          const prev = oldCovers[index - 1];

          if (!prev)
            throw `Invalid request: Update index ${index} exceeds profile cover size of ${oldCovers.length}`;

          oldCovers[index] = url;
        }
      }
    } else {
      delUrl = oldCovers;

      oldCovers = req.files.map((file) => file.publicUrl);
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
