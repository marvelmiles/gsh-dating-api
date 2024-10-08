import { createError, console500MSG } from "../utils/error.js";
import bcrypt from "bcrypt";
import {
  setJWTCookie,
  deleteCookie,
  validateVerificationReason,
  verifyAuthCode,
} from "../utils/auth.js";
import { isBreezeOrigin, isEmail, isObjectId } from "../utils/validators.js";
import { readTemplateFile, sendMail } from "../utils/file-handlers.js";
import { findUser, verifyJWToken } from "../utils/middlewares.js";
import { createSuccessBody } from "../utils/normalizers.js";
import {
  HTTP_CODE_INVALID_USER_ACCOUNT,
  SESSION_COOKIE_DURATION,
  COOKIE_KEY_ACCESS_TOKEN,
  COOKIE_KEY_REFRESH_TOKEN,
  HTTP_MSG_USER_EXISTS,
  HTTP_MSG_CODE_EXPIRED,
  HTTP_CODE_CODE_EXPIRED,
  HTTP_MSG_UNAUTHORIZE_ACCESS,
  HTTP_CODE_UNAUTHORIZE_ACCESS,
  HTTP_CODE_UNVERIFIED_EMAIL,
  PWD_RESET,
  HTTP_CODE_MAIL_ERROR,
  MAIL_CONST,
} from "../config/constants.js";
import { serializeUserToken } from "../utils/serializers.js";
import {
  appendKeyValue,
  getClientUrl,
  getRandomDoc,
  setFutureDate,
} from "../utils/index.js";
import { generateUsername, getUserEssentials } from "../utils/user.js";

const mailVerificationToken = async (
  User,
  user,
  CLIENT_ORIGIN,
  isPwd = false,
  errMsg,
  successMsg = "A verification code as been sent to your mail!"
) =>
  new Promise((resolve, reject) => {
    serializeUserToken(User, user)
      .then((token) => {
        const route = `${CLIENT_ORIGIN}/auth/token-verification`;

        const postRoute = `${user.id}`;

        const templateData = {
          token,
          fullname: user.fullname || "esteemed user",
          verifyLink: isPwd
            ? `${route}/password/${postRoute}`
            : `${route}/account/${postRoute}`,
          appClientHref: CLIENT_ORIGIN,
        };

        const isBreeze = isBreezeOrigin(CLIENT_ORIGIN);

        if (isBreeze) {
          templateData.appName = "Breezeup";
          templateData.supportMail = MAIL_CONST.user;
        } else {
          templateData.appName = "Soulmater";
          templateData.supportMail = MAIL_CONST.otherUser;
        }

        const mailStr = readTemplateFile(
          isPwd ? "pwdReset" : "accVerification",
          templateData
        );

        sendMail(
          {
            to: user.email,
            html: mailStr,
            text: mailStr,
            subject: isPwd
              ? `${templateData.appName} account password Reset`
              : `${templateData.appName} account verification`,
          },
          (err) => {
            if (err)
              reject(
                errMsg ? createError(errMsg, 503, HTTP_CODE_MAIL_ERROR) : err
              );
            else {
              user.resetDate = Date.now() + 60 * 1000 * 25;

              user
                .save()
                .then(() => {
                  resolve(createSuccessBody({ id: user.id }, successMsg));
                })
                .catch((err) => {
                  console500MSG(err, "SIGNUP_ERROR");

                  reject(
                    createError(
                      "Something went wrong! Failed to save token.",
                      500
                    )
                  );
                });
            }
          },
          MAIL_CONST.service,
          isBreeze ? MAIL_CONST.user : MAIL_CONST.otherUser,
          isBreeze ? process.env.MAIL_PASSWORD : process.env.MAIL_PASSWORD_OTHER
        );
      })
      .catch(reject);
  });

export const signup = async (req, res, next) => {
  try {
    const User = req.dbModels.User;

    const body = getUserEssentials(req.body);

    if (!isEmail(body.email))
      throw createError(
        "Account email address is invalid",
        400,
        HTTP_CODE_INVALID_USER_ACCOUNT
      );

    const conditions = [{ email: body.email }];

    if (body.username) {
      if (body.provider)
        body.username = await generateUsername(User, body.username);
      else conditions.push({ username: body.username });
    }

    let user = await User.findOne({
      $or: conditions,
    });

    console.log(conditions, body, user, "ignup");

    if (user)
      throw createError(
        HTTP_MSG_USER_EXISTS,
        400,
        HTTP_CODE_INVALID_USER_ACCOUNT
      );

    if (req.file?.publicUrl) body.photoUrl = req.file.publicUrl;

    user = await new User(body).save();

    res.json(createSuccessBody(user, "Account setup successful!"));

    // res.json(
    //   body.provider
    //     ? createSuccessBody(user, "Account setup successful!")
    //     : await mailVerificationToken(user)
    // );
  } catch (err) {
    console.log(err?.message, err?.status);
    next(err);
  }
};

export const verifyUserToken = async (req, res, next) => {
  try {
    switch (req.params.reason) {
      case "account":
        await verifyAuthCode(req);

        res.json(
          createSuccessBody(undefined, "Account verified successfully!")
        );
        break;
      case "password-reset":
        await verifyAuthCode(req, {
          resetToken: PWD_RESET,
          resetDate: setFutureDate(25, "mins"),
        });

        res.json(
          createSuccessBody(
            undefined,
            "Password reset code verified successfully!"
          )
        );
        break;
      default:
        throw "Invalid request reason. Expect one of account | password-reset";
    }
  } catch (err) {
    next(err);
  }
};

export const generateUserToken = async (req, res, next) => {
  try {
    const User = req.dbModels.User;

    validateVerificationReason(req.params.reason, req.user);

    res.json(await mailVerificationToken(User, req.user, getClientUrl(req)));
  } catch (err) {
    next(err);
  }
};

export const signin = async (req, res, next) => {
  try {
    const User = req.dbModels.User;

    const provider = req.body.provider;

    if (provider === "sandbox")
      req.body =
        (await getRandomDoc(User, { provider: "sandbox" })) || req.body;

    const conditions = [{ email: req.body.placeholder || req.body.email }];

    if (req.body.username && !req.body.provider)
      conditions.push({
        username: req.body.placeholder || req.body.username,
      });

    let user = await User.findOne({
      $or: conditions,
    });

    const err = createError(
      "Email or password is incorrect",
      400,
      HTTP_CODE_INVALID_USER_ACCOUNT
    );

    switch (provider) {
      case "sandbox":
        if (!user)
          throw "We're sorry, but you can't log in as a test user at the moment. Please create a new account and log in.";
        break;
      case "google":
        if (user) {
          if (provider !== user.provider)
            throw createError(
              `Sorry only one account can use the email address ${req.body.email}.`
            );
        } else {
          if (req.body.username)
            req.body.username = await generateUsername(User, req.body.username);

          const update = getUserEssentials(req.body);

          delete update.photoUrl;

          user = await new User(update).save();
        }
        break;
      default:
        if (!user) throw err;

        if (user.accountExpires)
          throw createError(
            "Login denied. Your account isn't verified.",
            403,
            HTTP_CODE_UNVERIFIED_EMAIL
          );

        if (user.provider)
          throw createError(
            HTTP_MSG_UNAUTHORIZE_ACCESS,
            403,
            HTTP_CODE_UNAUTHORIZE_ACCESS
          );

        if (!req.body.password) throw "Your password is required";

        if (!(await bcrypt.compare(req.body.password, user.password || "")))
          throw err;
        break;
    }

    user = await User.findByIdAndUpdate(
      { _id: user.id },
      {
        isLogin: true,
      },
      { new: true }
    );

    setJWTCookie(
      COOKIE_KEY_ACCESS_TOKEN,
      user.id,
      res,
      SESSION_COOKIE_DURATION.accessToken,
      req.query.rememberMe
    );

    setJWTCookie(
      COOKIE_KEY_REFRESH_TOKEN,
      user.id,
      res,
      SESSION_COOKIE_DURATION.refreshToken,
      req.query.rememberMe
    );

    res.json(createSuccessBody(user));
  } catch (err) {
    next(err);
  }
};

export const signout = async (req, res, next) => {
  try {
    console.log("singed out...");

    const User = req.dbModels.User;

    deleteCookie(COOKIE_KEY_ACCESS_TOKEN, res);
    deleteCookie(COOKIE_KEY_REFRESH_TOKEN, res);

    const update = {
      isLogin: false,
    };

    req.body.settings && appendKeyValue("settings", req.body.settings, update);

    await User.updateOne(
      {
        _id: req.user.id,
      },
      update
    );

    res.json(createSuccessBody(undefined, "You just got signed out!"));
  } catch (err) {
    next(err);
  }
};

export const userExists = async (req, res, next) => {
  try {
    await findUser(req, res);

    res.json(createSuccessBody(!!req.user));
  } catch (err) {
    next(err);
  }
};

export const recoverPwd = async (req, res, next) => {
  try {
    const User = req.dbModels.User;

    if (req.user.provider)
      throw createError(
        HTTP_MSG_UNAUTHORIZE_ACCESS,
        403,
        HTTP_CODE_UNAUTHORIZE_ACCESS
      );

    res.json(
      await mailVerificationToken(User, req.user, getClientUrl(req), true)
    );
  } catch (err) {
    next(err);
  }
};

export const resetPwd = async (req, res, next) => {
  try {
    const User = req.dbModels.User;

    if (!isObjectId(req.body.userId)) throw "Invalid request";

    if (!req.body.password) throw "Invalid request. New password is required.";

    const user = await User.findOne({
      _id: req.body.userId,
      resetDate: { $gt: Date.now() },
    });

    const expiredErr = createError(
      HTTP_MSG_CODE_EXPIRED,
      400,
      HTTP_CODE_CODE_EXPIRED
    );

    if (!user) throw expiredErr;

    if (user.provider)
      throw createError(
        HTTP_MSG_UNAUTHORIZE_ACCESS,
        403,
        HTTP_CODE_UNAUTHORIZE_ACCESS
      );

    req.user = user;
    req.params.reason = PWD_RESET;

    if (user.resetToken === PWD_RESET)
      await user.updateOne({
        password: req.body.password,
        resetDate: null,
        resetToken: null,
      });
    else
      await verifyAuthCode(req, {
        password: req.body.password,
      });

    res.json(createSuccessBody(undefined, "Password reset successful"));
  } catch (err) {
    console.log(err.message, "gk");
    next(err);
  }
};

export const refreshTokens = async (req, res, next) => {
  try {
    console.log("refresh-tokens");

    verifyJWToken(req, {
      applyRefresh: true,
    });

    if (req.user)
      setJWTCookie(
        COOKIE_KEY_ACCESS_TOKEN,
        req.user.id,
        res,
        SESSION_COOKIE_DURATION.accessToken,
        req.query.rememberMe
      );
    else throw createError(`Forbidden access`, 403);

    res.json(createSuccessBody(undefined, "Access token refreshed"));
  } catch (err) {
    next(createError(err.message, 403));
  }
};
