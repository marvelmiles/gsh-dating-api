import { appendKeyValue } from ".";

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
