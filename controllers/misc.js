import { MAIL_CONST } from "../config/constants";
import User from "../models/User";
import { getAll } from "../utils";
import { sendMail } from "../utils/file-handlers";
import { createSuccessBody } from "../utils/normalizers";
import { createSearchQuery } from "../utils/serializers";

export const mailFeedback = async (req, res, next) => {
  try {
    if (!req.body.email) throw "Invalid request: Expect a valid email address";

    if (!req.body.message) throw "Invalid request: Missing message";

    sendMail(
      {
        from: req.body.email,
        to: MAIL_CONST.user,
        subject: "USER COMPLAINT",
        text: req.body.message,
      },
      (err) => {
        if (err)
          return next({
            message: "Encountered an error, while sending your message",
            status: 400,
          });
        else {
          res.json(
            createSuccessBody(undefined, "Thank you for your feedback!")
          );
        }
      }
    );
  } catch (err) {
    next(err);
  }
};

export const search = async (req, res, next) => {
  try {
    const result = {};

    for (const key of req.query.select
      ? req.query.select.split(" ")
      : ["users"]) {
      switch (key) {
        case "users":
          result.users = await getAll(
            User,
            req.query,
            createSearchQuery(req.query)
          );
          continue;
        default:
          throw `Invalid select key ${key}`;
      }
    }

    return res.json(createSuccessBody(result));
  } catch (err) {
    next(err);
  }
};
