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
          ]
        : [];

      const bioRules = query.bio
        ? query.bio.map((key) => {
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

      const $match = {
        ...match,
        ...(query?.mandatory?.filter || query.strictSearch
          ? toObj(bioFilterRules)
          : {}),
        ...(query.strictSearch ? toObj(bioRules) : {}),
        ...(query.strictSearch ? toObj(rules) : {}),
        $or: query.searchUid
          ? query.searchUid
              .split(" ")
              .filter((id) => isObjectId(id))
              .map((id) => ({
                _id: {
                  $ne: id,
                },
              }))
          : [],
      };

      if (query.strictSearch ? false : !query?.mandatory?.filter)
        $match.$or = $match.$or.concat(bioFilterRules);

      if (!query.strictSearch) $match.$or = $match.$or.concat(rules, bioRules);

      if (!$match.$or.length) delete $match.$or;

      const pipeRules = {
        $match,
      };

      if (query.sortRelevance) {
        for (const key in query.sortRelevance) {
          let values = query.sortRelevance[key];

          if (query.strictSearch) $match[key] = { $exists: true };

          const priorityKey = `${key}Priority`;

          if (values || !isNaN(values)) {
            values = Array.isArray(values) ? values : [values];

            pipeRules.$addFields = {
              [priorityKey]: {
                $switch: {
                  branches: values.map((value, i) => ({
                    case: { $eq: [`$${key}`, value] },
                    then: i + 1,
                  })),
                  default: values.length + 1,
                },
              },
            };

            pipeRules.$sort = {
              [priorityKey]: 1,
              id: -1,
            };

            pipeRules.overrideSort = true;

            pipeRules.$project = { [priorityKey]: 0 };
          }
        }
      }

      console.log(pipeRules.$match, query);

      return pipeRules;
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
