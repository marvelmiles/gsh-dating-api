import jwt from "jsonwebtoken";
import { createError } from "../utils/error.js";
import { deleteFile } from "./file-handlers.js";
import {
  HTTP_MSG_UNAUTHORIZE_ACCESS,
  HTTP_MSG_403,
  HTTP_CODE_UNAUTHORIZE_ACCESS,
  allowedOrigins,
} from "../config/constants.js";
import { isObjectId } from "./validators.js";
import User from "../models/User.js";
import queryTypes from "query-types";
import qs from "qs";

const select = "-kycDocs._id -kycIds._id";

export const verifyJWToken = (req, res = {}, next) => {
  const { applyRefresh } = res;
  const rToken = req.cookies.refresh_token
    ? req.cookies.refresh_token
    : undefined;

  const token = applyRefresh ? rToken?.jwt || rToken : req.cookies.access_token;

  const status = applyRefresh ? 403 : 401;
  const throwErr = next === undefined;

  if (!token) {
    const err = createError(
      applyRefresh ? HTTP_MSG_403 : HTTP_MSG_UNAUTHORIZE_ACCESS,
      status
    );
    if (throwErr) throw err;
    else next(err);
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      err = createError(
        applyRefresh ? HTTP_MSG_403 : HTTP_MSG_UNAUTHORIZE_ACCESS,
        status
      );
      if (throwErr) throw err;
      else next(err);
      return;
    }

    req.user = user;
    req.body && delete req.body._id;

    !throwErr && next();
  });
};

export const errHandler = (err, req, res, next) => {
  if (res.headersSent) {
    console.warn(
      "[SERVER_ERROR: HEADER SENT]",
      req.headers.origin,
      req.originalUrl,
      " at ",
      new Date()
    );
  } else {
    if (res.headersSent) return;

    if (req.timedout)
      err = createError(
        {
          message: err.message,
          code: err.code,
          details: {
            timeout: err.timeout,
          },
        },
        err.statusCode || err.status
      );

    err = err.status
      ? err
      : (err.message ? (err.url = req.url || "-") : true) && createError(err);

    if (err) res.status(err.status).json(err);
    else
      res.status(500).json({
        message: "Internal server error",
        code: "INTERNAL_SERVER_ERROR",
      });
  }

  if (req.file) deleteFile(req.file.publicUrl);
  if (req.files)
    for (const { publicUrl } of req.files) {
      deleteFile(publicUrl);
    }
};

export const validateCors = (origin = "", cb) => {
  origin = origin.headers ? origin.headers.origin : origin;

  if (true || !origin || allowedOrigins.includes(origin))
    cb(null, {
      origin: true,
      optionsSuccessStatus: 200,
      credentials: true,
      methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    });
  else cb(createError(`Origin ${origin} blocked by cors`, 403));
};

export const findUser = async (req, res = {}, next) => {
  try {
    const match = res.match || {};

    const message = createError(
      HTTP_MSG_UNAUTHORIZE_ACCESS,
      403,
      HTTP_CODE_UNAUTHORIZE_ACCESS
    );

    const email = req.body.email || req.body.placeholder || req.user?.email;

    const _id =
      req.params.userId ||
      req.body.userId ||
      req.body.placeholder ||
      req.user?.id;

    const username =
      req.body.username || req.body.placeholder || req.user?.username;

    if (!(_id || email || username))
      throw "Invalid request. Expect <an email | id | placeholder> in body or url";

    if (username) match.username = username;
    else if (_id) {
      if (!isObjectId(_id)) throw message;
      match._id = _id;
    } else match.email = email;

    if (!(req.user = await User.findOne(match).select(select))) throw message;

    if (next) next();
  } catch (err) {
    if (next) next(err);
    else throw err;
  }
};

export const validateUserMailVerification = async (req, res, next) => {
  try {
    if (!req.user.mailVerifiedAt || req.user.accountExpires)
      throw createError(
        HTTP_MSG_UNAUTHORIZE_ACCESS,
        403,
        HTTP_CODE_UNAUTHORIZE_ACCESS
      );

    next();
  } catch (err) {
    next(err);
  }
};

export const queryTypeHandler = [
  (req, res, next) => {
    req.query = qs.parse(req.query, {
      decodeDotInKeys: true,
      parseArrays: req.query.parseArrays
        ? req.query.parseArrays === "true"
        : true,
    });
    next();
  },
  queryTypes.middleware(),
];
