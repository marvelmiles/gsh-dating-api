import mongoose from "mongoose";
import { MAIL_CONST } from "../config/constants";
import User from "../models/User";
import { getAll } from "../utils";
import { sendMail } from "../utils/file-handlers";
import { createSuccessBody } from "../utils/normalizers";
import { createSearchQuery } from "../utils/serializers";

export const mailFeedback = async (req, res, next) => {
  try {
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
          res.json(createSuccessBody(null, "Thamk you for contacting us!"));
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

    for (const key of req.query.select || ["users"]) {
      switch (key) {
        case "users":
          result.users = await getAll(User, req.query, createSearchQuery());
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
