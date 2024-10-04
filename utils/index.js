import { isProdMode } from "../config/constants";
import { isObject } from "./validators";

export const getAll = async (model, reqQuery, pipeRules = {}) => {
  return new Promise(async (resolve, reject) => {
    const page = parseInt(reqQuery.page) || 1;

    const totalDocs = await model.countDocuments(pipeRules.$match);

    const size =
      reqQuery.limit === "all" ? totalDocs : Number(reqQuery.limit) || 10;

    const totalPages = Math.ceil(totalDocs / size);

    let pipeline = [
      { $match: pipeRules.$match },
      {
        $addFields: {
          ...pipeRules.$addFields,
          id: "$_id",
        },
      },
      {
        $sort: pipeRules.overrideSort
          ? pipeRules.$sort
          : { id: -1, ...pipeRules.$sort },
      },
      { $skip: (page - 1) * size },
      { $limit: size },
      {
        $project: {
          ...pipeRules.$project,
          _id: 0,
          password: 0,
        },
      },
    ];

    const randomize = reqQuery.type === "similar";

    // if (randomize) pipeline.push({ $sample: { size: size } });

    const data = await model.aggregate(pipeline);

    setTimeout(
      () => {
        return resolve({
          totalDocs,
          totalPages,
          currentPage: page,
          data,
        });
      },
      isProdMode ? 0 : 3000
    );
  });
};

export const setFutureDate = (number, format = "day", date = new Date()) => {
  return new Date(
    new Date(date).getTime() +
      number *
        {
          day: 86400000,
          mins: 60000,
        }[format]
  );
};

export const appendKeyValue = (path, updateObj, oldObj) => {
  if (updateObj === undefined) return oldObj;

  if (!isObject(updateObj))
    throw `Invalid request: Expect ${path} to be of type Object`;

  for (const key in updateObj) {
    const v = updateObj[key];

    if (typeof v === "function" || typeof v === "symbol")
      throw `Invalid request: Expect ${key} to be of primitive type`;

    oldObj[`${path}.${key}`] = v;
  }

  return oldObj;
};

export const toObj = (arr) => {
  let obj = {};

  for (const item of arr) {
    obj = {
      ...obj,
      ...item,
    };
  }

  return obj;
};

export const getClientUrl = (req = "", fullUrl = false) => {
  const origin =
    typeof req === "string"
      ? req
      : req.headers.origin ||
        req.headers.referer ||
        `${req.protocol}://${req.get("host")}${fullUrl ? req.originalUrl : ""}`;

  return origin.endsWith("/") ? origin.slice(0, origin.length - 1) : origin;
};
