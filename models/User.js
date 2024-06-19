import mongoose from "mongoose";
import { isEmail, isPassword, isObject } from "../utils/validators";
import bcrypt from "bcrypt";
import { createError } from "../utils/error";
import { HTTP_CODE_VALIDATION_ERROR, SERVER_ORIGIN } from "../config/constants";

const schema = new mongoose.Schema(
  {
    lastname: {
      type: String,
      // required: "Your lastname is required",
    },
    firstname: {
      type: String,
      // required: "Your firstname is required",
    },
    username: {
      type: String,
      unique: true,
      required: "Your username or nickname is required",
    },
    email: {
      type: String,
      required: "Your email is required",
      unique: true,
      validate: {
        validator: function (v) {
          return isEmail(v);
        },
        message: "Your email address is invalid",
      },
    },
    password: {
      type: String,
      required: "Your password is required",
      set(v) {
        console.log("val set pwd..", v, this.invalidate);

        if (v.length < 8) {
          this.invalidate(
            "password",
            "Password is shorter than minimum allowed length (8)"
          );

          return v;
        }

        const msg = isPassword(v);

        if (msg) {
          this.invalidate("passowrd", msg);

          return v;
        }

        return bcrypt.hashSync(v, bcrypt.genSaltSync(10));
      },
    },
    photoUrl: String,
    coverMedias: {
      type: Array,
      default: [],
    },
    lastLogin: Date,
    isLogin: {
      type: Boolean,
      default: false,
      set(v) {
        if (v) this.lastLogin = new Date();

        return v;
      },
    },
    provider: String,
    resetToken: String,
    resetDate: Date,
    bio: {
      type: Object,
      default: {
        _id: new mongoose.Types.ObjectId(),
      },
      set(v) {
        if (!isObject(v)) {
          const err =
            "Invalid request body. Expect user bio to be of type Object";

          if (this.invalidate) throw this.invalidate("settings", err);
          else throw createError(err, 400, HTTP_CODE_VALIDATION_ERROR);
        }

        return v;
      },
    },
    settings: {
      type: Object,
      default: {
        _id: new mongoose.Types.ObjectId(),
      },
      set(v) {
        if (!isObject(v)) {
          const err =
            "Invalid request body. Expect user settings to be of type Object";

          if (this.invalidate) throw this.invalidate("settings", err);
          else throw createError(err, 400, HTTP_CODE_VALIDATION_ERROR);
        }

        return v;
      },
    },
    verifiedAt: Date,
    mailVerifiedAt: Date,
    accountExpires: {
      type: Date,
      default: function () {
        if (this.isAdmin) return;

        return Date.now() + 7 * 24 * 60 * 60 * 1000; // after 7d;
      },
    },
    referrals: [
      {
        type: mongoose.Types.ObjectId,
        ref: "user",
      },
    ],
    referralCode: String,
    kycDocs: {
      type: Object,
      default: {
        _id: new mongoose.Types.ObjectId(),
      },
    },
    kycIds: {
      type: Object,
      default: {
        _id: new mongoose.Types.ObjectId(),
      },
    },
  },
  {
    collection: "user",
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;

        delete ret._id;
        delete ret.password;
        delete ret.resetToken;
        delete ret.resetDate;
        delete ret.bio._id;
        delete ret.kycIds._id;
        delete ret.kycDocs._id;
        delete ret.settings._id;
      },
    },
  }
);

schema.virtual("fullname").get(function () {
  return this.firstname + " " + this.lastname;
});

schema.virtual("referralLink").get(function () {
  return `${SERVER_ORIGIN}?ref=${this.referralCode}`;
});

schema.virtual("expired").get(function () {
  return !!(
    this.accountExpires &&
    new Date().getTime() >= new Date(this.accountExpires).getTime()
  );
});

export default mongoose.model("user", schema);
