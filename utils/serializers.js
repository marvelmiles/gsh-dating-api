import { toObj } from ".";
import { generateBcryptHash, generateUUID } from "./auth";
import { isObjectId } from "./validators";

export const serializeUserToken = async (
  User,
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

export const serializeUserRefferalCode = async (User, user) => {
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

      console.log(query, "query ser");

      const bioRules = query.bio
        ? (Array.isArray(query.bio) ? query.bio : query.bio.split(" ")).map(
            (key) => {
              return {
                [`bio.${key.toString()}`]: search,
              };
            }
          )
        : [];

      const bioFilterRules = query.filter
        ? Object.keys(query.filter).map((key) => {
            return {
              [`bio.${key}`]: query.filter[key],
            };
          })
        : [];

      const mandatoryQ = query.strictSearch || query?.mandatory?.q;
      const mandatoryFilter = query?.mandatory?.filter || query.strictSearch;

      const $match = {
        ...match,
        ...(mandatoryQ ? toObj(rules) : {}),
        ...(mandatoryQ ? toObj(bioRules) : {}),
        ...(mandatoryFilter ? toObj(bioFilterRules) : {}),
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

      if (!mandatoryFilter) $match.$or = $match.$or.concat(bioFilterRules);

      if (!mandatoryQ) $match.$or = $match.$or.concat(rules, bioRules);

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

      console.log(pipeRules.$match, " search serializer...");

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
