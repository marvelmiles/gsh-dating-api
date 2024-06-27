import { appendKeyValue } from ".";
import User from "../models/User";
import { generateUUID } from "./auth";
import { v4 as uuid } from "uuid";

export const appendUserKeyValue = ({ settings, bio }, oldObj) => {
  appendKeyValue("bio", bio, oldObj);

  appendKeyValue("settings", settings, oldObj);

  return oldObj;
};

export const getUserEssentials = (body) => {
  const data = {
    firstname: body.firstname,
    lastname: body.lastname,
    username: body.username,
    email: body.email,
    password: body.password,
    photoUrl: body.photoUrl,
    provider: body.provider,
    bio: body.bio,
    settings: body.settings,
  };

  appendUserKeyValue(data, data);

  for (const key in data) {
    if (data[key] === undefined) delete data[key];
  }

  return data;
};

export const generateUsername = async (username = "user") => {
  let name = username;

  const maxAttempts = 500;

  for (let i = 0; i < maxAttempts; i++) {
    let user = await User.findOne({ username: name });

    if (!user) return name;
    else {
      if (i >= maxAttempts - 1) name = username + "_" + uuid();
      else name = username + "_" + generateUUID();
    }
  }

  throw "Exceeded maximum attempts to generate a unique username";
};
