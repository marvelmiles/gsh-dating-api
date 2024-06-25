import mongoose from "mongoose";
import { isEmail, isPassword } from "../utils/validators";
import bcrypt from "bcrypt";
import { SERVER_ORIGIN } from "../config/constants";
import { invalidate } from "../utils/error";

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
      // required: "Your username or nickname is required",
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
        console.log("val set pwd..", v, v.length, this.invalidate);

        if (v.length < 8)
          throw invalidate(
            "Password is shorter than minimum allowed length (8)",
            "password"
          );

        const msg = isPassword(v);

        if (msg) throw invalidate(msg, "password");

        return bcrypt.hashSync(v, bcrypt.genSaltSync(10));
      },
    },
    photoUrl: String,
    profileCover: {
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
    },
    settings: {
      type: Object,
      default: {
        _id: new mongoose.Types.ObjectId(),
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
