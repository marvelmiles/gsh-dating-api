import mongoose from "mongoose";
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
        $or: [],
      };

      if (query.searchUid)
        $match._id = {
          $nin: query.searchUid
            .split(" ")
            .filter((id) => isObjectId(id))
            .map((id) => ({
              _id: id,
            })),
        };

      if (!mandatoryFilter) $match.$or = $match.$or.concat(bioFilterRules);

      if (!mandatoryQ) $match.$or = $match.$or.concat(rules, bioRules);

      const pipeRules = {
        $match,
      };

      const setRelevanceProp = (path) => {
        pipeRules.overrideSort = true;

        pipeRules.$sort = { ...pipeRules.$sort, [path]: 1, _id: -1 };

        pipeRules.$project = { ...pipeRules.$project, [path]: 0 };
      };

      if ($match.$or.length) {
        const path = "matchScore";

        pipeRules.$addFields = {
          ...pipeRules.$addFields,
          [path]: {
            $switch: {
              branches: $match.$or.map((obj) => {
                return {
                  case: {
                    $regexMatch: {
                      input: {
                        $ifNull: [
                          {
                            $getField: Object.keys(obj)[0] || "",
                          },
                          "",
                        ],
                      },
                      regex: new RegExp(query.q, "i"),
                    },
                  },
                  then: 1,
                };
              }),
              default: 0,
            },
          },
        };

        setRelevanceProp(path);
      }

      if (!$match.$or.length) delete $match.$or;

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

            setRelevanceProp(priorityKey);
          }
        }
      }

      console.log(
        pipeRules.$match.$or,
        pipeRules.$addFields?.matchScore &&
          pipeRules.$addFields.matchScore.$switch.branches,
        query.q,
        " search serializer..."
      );

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
