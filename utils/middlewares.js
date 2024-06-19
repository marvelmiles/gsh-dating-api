import jwt from "jsonwebtoken";
import { createError } from "../utils/error.js";
import { deleteFile } from "./file-handlers.js";
import {
  CLIENT_ORIGIN,
  TOKEN_EXPIRED_MSG,
  HTTP_403_MSG,
  HTTP_MSG_UNAUTHORIZED_ACCESS,
  HTTP_CODE_UNAUTHORIZE_ACCESS,
} from "../config/constants.js";

export const verifyJWToken = (req, res = {}, next) => {
  const { applyRefresh } = res;
  const rToken = req.cookies.refresh_token
    ? req.cookies.refresh_token
    : undefined;

  const token = applyRefresh ? rToken?.jwt || rToken : req.cookies.access_token;

  const status = applyRefresh ? 403 : 401;
  const throwErr = next === undefined;
  if (!token) {
    const err = createError(TOKEN_EXPIRED_MSG, status);
    if (throwErr) throw err;
    else next(err);
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      err = createError(
        applyRefresh ? HTTP_403_MSG : TOKEN_EXPIRED_MSG,
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
  }

  if (req.file) deleteFile(req.file.publicUrl);
  if (req.files)
    for (const { publicUrl } of req.files) {
      deleteFile(publicUrl);
    }
};

export const validateCors = (origin = "", cb) => {
  origin = origin.headers ? origin.headers.origin : origin;

  if (!origin || origin === CLIENT_ORIGIN || true)
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
      res.message || HTTP_MSG_UNAUTHORIZED_ACCESS,
      res.status || 403,
      res.code || HTTP_CODE_UNAUTHORIZE_ACCESS
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
      throw "Invalid request. Expect email or id in body or url";

    if (_id) {
      if (!isObjectId(_id)) throw message;
      match._id = _id;
    } else if (email) match.email = email;
    else match.username = username;

    if (!(req.user = await User.findOne(match).select(select))) throw message;

    if (next) next();
  } catch (err) {
    if (next) next(err);
    else throw err;
  }
};
