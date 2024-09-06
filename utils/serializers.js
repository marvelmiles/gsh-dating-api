import { toObj } from ".";
import User from "../models/User";
import { generateBcryptHash, generateUUID } from "./auth";
import { isObjectId } from "./validators";

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
      const rules = query.q
        ? [
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
              fullname: search,
            },
          ]
        : [];

      const bioRules = query.bio
        ? query.bio.split(" ").map((key) => {
            return {
              [`bio.${key.toString()}`]: search,
            };
          })
        : [];

      const bioFilterRules = query.filter
        ? Object.keys(query.filter).map((key) => {
            return {
              [`bio.${key}`]: query.filter[key],
            };
          })
        : [];
      const _rules = {
        ...match,
        _id: {
          $ne:
            query.searchUid && isObjectId(query.searchUid)
              ? query.searchUid
              : undefined,
        },
        ...(query?.mandatory?.filter || query.strictFilter
          ? toObj(bioFilterRules)
          : {}),
        ...(query.strictFilter ? toObj(bioRules) : {}),
        ...(query.strictFilter ? toObj(rules) : {}),
        $or: [],
      };

      if (query.strictFilter ? false : !query?.mandatory?.filter)
        _rules.$or = _rules.$or.concat(bioFilterRules);

      if (!query.strictFilter) _rules.$or = _rules.$or.concat(rules, bioRules);

      if (!_rules.$or.length) delete _rules.$or;

      return _rules;
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
