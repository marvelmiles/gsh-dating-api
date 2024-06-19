export const isProdMode = process.env.NODE_ENV === "production";

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
