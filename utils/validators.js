import mongoose from "mongoose";
import { replaceString } from "./serializers";

export const isEmail = (str) => {
  return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(
    str
  );
};

export const isObject = (obj) =>
  obj &&
  (typeof obj.toString === "function"
    ? obj.toString() === "[object Object]"
    : typeof obj === "object" && obj.length === undefined);

export const isObjectId = (id) => mongoose.isObjectIdOrHexString(id);

export const isDueDate = (date) =>
  new Date(date).getTime() <= new Date().getTime();

export const isPassword = (password) => {
  if (password.length < 8) return "Weak";

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/\-|=]/.test(password);

  let msg = "";

  if (!hasUpperCase) msg += "Password should contain an uppercase";

  if (!hasLowerCase)
    msg += msg.length ? ", lowercase" : "Password should contain a lowercase";

  if (!hasNumbers)
    msg += msg.length ? ", number" : "Password should contain a number";

  if (!hasSymbols)
    msg += msg.length ? ", symbol" : "Password should contain a symbol";

  if (msg) msg = replaceString(msg, ",", " and a");

  return msg;
};

export const isBreezeOrigin = (CLIENT_ORIGIN = "") => {
  console.log(
    CLIENT_ORIGIN,
    CLIENT_ORIGIN.toLowerCase().indexOf("breezeup") > -1 ||
      CLIENT_ORIGIN.toLowerCase().indexOf("gsh-rouge") > -1 ||
      CLIENT_ORIGIN.toLowerCase().indexOf("sgh-dating-api.glitch.me") > -1,
    "is breeze...."
  );
  return (
    CLIENT_ORIGIN.toLowerCase().indexOf("breezeup") > -1 ||
    CLIENT_ORIGIN.toLowerCase().indexOf("gsh-rouge") > -1 ||
    CLIENT_ORIGIN.toLowerCase().indexOf("sgh-dating-api.glitch.me") > -1
  );
};
