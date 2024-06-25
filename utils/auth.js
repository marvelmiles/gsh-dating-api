import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  HTTP_CODE_CODE_EXPIRED,
  HTTP_CODE_UNVERIFIED_EMAIL,
  HTTP_CODE_VALIDATION_ERROR,
  HTTP_MSG_CODE_EXPIRED,
  HTTP_MSG_INVALID_VERIFICATION_CODE,
  cookieConfig,
} from "../config/constants.js";
import { createError } from "./error.js";
import { setFutureDate } from "./index.js";
import { isDueDate } from "./validators.js";

export const generateUUID = (format = "auth-code") => {
  switch (format) {
    case "auth-code":
      return crypto.randomInt(100000, 1000000).toString();
    default:
      return;
  }
};

export const deleteCookie = (name, res) => {
  const expires = new Date();
  expires.setFullYear(1990);
  res.cookie(name, "", { ...cookieConfig, expires });
};

export const setJWTCookie = (name, uid, res, time = {}, withExtend) => {
  let { duration = 1, extend, type = "h" } = time;
  duration = withExtend ? extend : duration;

  let expires = new Date();

  switch (type) {
    case "h":
      expires.setHours(expires.getHours() + duration);
      break;
    case "d":
      expires = setFutureDate(duration);
      break;
    case "m":
      expires.setMinutes(expires.getMinutes() + duration);
      break;
  }

  res.cookie(
    name,
    jwt.sign({ id: uid }, process.env.JWT_SECRET, {
      expiresIn: duration + type,
    }),
    {
      ...cookieConfig,
      expires,
    }
  );
};

export const validateVerificationReason = (reason, user) => {
  switch (reason) {
    case "account":
      if (user.mailVerifiedAt)
        throw createError("Account signup mail has been verified!", 403);
      break;
    case "password-reset":
      if (user.accountExpires)
        throw createError(
          "Unable to process or generate a verification token for an unverified account!",
          428,
          HTTP_CODE_UNVERIFIED_EMAIL
        );
      break;
    default:
      throw HTTP_MSG_INVALID_VERIFICATION_CODE;
  }
};

export const verifyAuthCode = async (req, update) => {
  const err = createError(
    HTTP_MSG_INVALID_VERIFICATION_CODE,
    400,
    HTTP_CODE_VALIDATION_ERROR
  );

  if (!(req.body.code && req.user.resetToken)) throw err;

  if (isDueDate(req.user.resetDate))
    throw createError(HTTP_MSG_CODE_EXPIRED, 400, HTTP_CODE_CODE_EXPIRED);

  if (!(await bcrypt.compare(req.body.code, req.user.resetToken))) throw err;

  const _update = {
    resetToken: "",
    resetDate: null,
    ...update,
  };

  validateVerificationReason(req.params.reason, req.user);

  _update.accountExpires = null;
  _update.mailVerifiedAt = req.user.mailVerifiedAt || new Date();

  await req.user.updateOne(_update);
};

export const generateBcryptHash = async (str = "", rounds = 10) => {
  return await bcrypt.hash(str + "", await bcrypt.genSalt(rounds));
};
