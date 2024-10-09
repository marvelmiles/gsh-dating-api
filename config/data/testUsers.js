import { getRandomElement, getRandomNumber } from "../../utils";
import {
  getSocialLink,
  generateAboutMe,
  generateFullName,
  generateNigerianPhoneNumber,
  generateProfileCover,
} from "../../utils/psuedo";
import { countries, eyeColors, languages } from "./largeData";

const generateUserData = (userIndex) => {
  const gender = getRandomElement(["Male", "Female"]);

  const rCountry = getRandomElement(countries);
  const fullname = generateFullName(gender);

  const bio = {
    gender,
    fullname,
    aboutMe: generateAboutMe(gender),
    age: getRandomNumber(18, 60),
    height: getRandomNumber(4, 11, 2), // in ft
    weight: getRandomNumber(5, 100, 2), // in pounds
    ethnicity: getRandomElement([
      "Arabian",
      "Asian",
      "Ebony(Black)",
      "Caucasian(White",
      "Hispanic",
      "Indian",
      "Latin",
      "Mongolia",
      "Mixed race",
      "Others",
    ]),
    hairColor: getRandomElement(["Red", "Blonde", "Brown", "Black", "Others"]),
    hairLength: getRandomElement(["Short", "Medium", "Long"]),
    breastSize: getRandomElement([
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "Others",
    ]),
    breastType: getRandomElement(["Natural", "Sillicon"]),
    nationality: getRandomElement(countries).country,
    travel: getRandomElement([
      "No",
      "Country Wide",
      "Europe",
      "Worldwide",
      "Others",
    ]),
    language: getRandomElement(languages),
    tatoo: getRandomElement(["Yes", "No"]),
    piercing: getRandomElement([
      "No",
      "Belly",
      "Eyebrow",
      "Genitals",
      "Mouth Area",
      "Nose",
      "Nipples",
      "Tongue",
      "Others",
    ]),
    smoking: getRandomElement(["Yes", "No"]),
    eyeColor: getRandomElement(eyeColors),
    pubicHair: getRandomElement(["Trimmed", "Shaved", "Natural"]),
    pornStar: getRandomElement(["Yes", "NO"]),
    interestedIn: getRandomElement(["Woman", "Couples", "Man", "Anyone"]),
    phone: generateNigerianPhoneNumber(),
    residentCountry: rCountry.country,
    city: getRandomElement(rCountry.cities),
    whatsappID: getSocialLink("wa", getRandomElement([fullname, ""])),
    telegramID: getSocialLink("tg", getRandomElement([fullname, ""])),
    facebookID: getSocialLink("fb", getRandomElement([fullname, ""])),
  };

  const rates = [
    "30 Minutes",
    "1 Hour",
    "2 Hours",
    "3 Hours",
    "6 Hours",
    "12 Hours",
    "24 Hours",
    "48 Hours",
    "Another 24 Hours",
  ];

  for (const rate of rates) {
    bio[`${rate}-incall`] = getRandomNumber(150, 2500);
  }

  for (const rate of rates) {
    bio[`${rate}-outcall`] = getRandomNumber(150, 2500);
  }

  return {
    bio,
    provider: "sandbox",
    email: `testUser${userIndex}@sandbox.com`,
    profileCover: generateProfileCover(gender),
  };
};

const testUsers = [];

for (let i = 1; i < 81; i++) {
  testUsers.push(generateUserData(i));
}

export default testUsers;
