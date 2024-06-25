import User from "../models/User";
import { generateBcryptHash, generateUUID } from "./auth";

export const serializeUserToken = async (
  user,
  milliseconds = Date.now() + 60 * 1000 * 25
) => {
  let token;

  do {
    token = generateUUID();
    user.resetToken = await generateBcryptHash(token);

    user.resetDate = new Date(milliseconds);
  } while (
    await User.findOne({
      resetToken: user.resetToken,
    })
  );

  console.log("new u token...", token);

  return token;
};

export const serializeUserRefferalCode = async (user) => {
  let code;

  do {
    code = generateUUID();
  } while (!!(await User.findOne({ referralCode: code })));

  user.referralCode = code;
};

export const createSearchQuery = (query = {}, reason = "users") => {
  const search = query.q
    ? {
        $regex: query.q,
        $options: "i",
      }
    : {
        $ne: undefined,
      };

  let match = {};

  switch (reason) {
    case "users":
      return {
        ...match,
        _id: {
          $ne: query.searchUid
            ? new mongoose.Types.ObjectId(query.searchUid)
            : undefined,
        },
        $or: [
          {
            firstname: search,
          },
          {
            lastname: search,
          },
          {
            username: search,
          },
          {
            email: search,
          },
          {
            firstname: search,
          },
          ...(query.bio
            ? query.bio.split(" ").map((key) => {
                return {
                  [`bio.${key.toString()}`]: search,
                };
              })
            : []),
        ],
      };
  }
};

export const replaceString = (inputString, oldInput, newInput = "") => {
  const lastIndex = inputString.lastIndexOf(oldInput);

  if (lastIndex !== -1) {
    return (
      inputString.substring(0, lastIndex) +
      newInput +
      inputString.substring(lastIndex + 1)
    );
  }

  return inputString;
};
