import { isEmail, isPassword } from "../utils/validators";
import bcrypt from "bcrypt";
import { SERVER_ORIGIN } from "../config/constants";
import { invalidate } from "../utils/error";
import { Schema, Types, model } from "mongoose";

const schema = new Schema(
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
      required: [
        function () {
          return !this.provider;
        },
        "Your password is required",
      ],
      set(v) {
        console.log(
          "val set pwd..",
          v,
          v?.length,
          this.invalidate,
          this.provider
        );

        if (this.provider) return "";

        if (!v) throw invalidate("Your password is required", "password");

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
    provider: {
      type: String,
      enum: {
        values: ["google"],
        message: "{VALUE} is not a valid provider. Accepted values: google",
      },
    },
    resetToken: String,
    resetDate: Date,
    bio: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    settings: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    verifiedAt: Date,
    mailVerifiedAt: {
      type: Date,
      default: function () {
        if (this.provider) return new Date();
        else return null;
      },
    },
    accountExpires: {
      type: Date,
      default: function () {
        if (this.provider) return null;

        return Date.now() + 7 * 24 * 60 * 60 * 1000; // after 7d;
      },
    },
    referrals: [
      {
        type: Types.ObjectId,
        ref: "user",
      },
    ],
    referralCode: String,
    kycDocs: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    kycIds: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
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
      },
    },
  }
);

schema.virtual("fullname").get(function () {
  if (this.firstname || this.lastname)
    return ((this.firstname || "") + " " + (this.lastname || "")).trim();
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

export default model("user", schema);
