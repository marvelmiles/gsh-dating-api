import "../env";
import { generateProfileCover } from "../../utils/psuedo";

export const TEST_ACCOUNT_PASSWORD =
  process.env.SEED_TEST_ACCOUNT_PASSWORD || "TestUser@123";

export const SANDBOX_ACCOUNT_TOTAL = 80;

export const buildSandboxAccountEmail = (index) =>
  `testUser${index}@sandbox.com`;

const buildCredentialAccount = ({
  email,
  username,
  firstname,
  lastname,
  gender,
  age,
  city,
  residentCountry,
  aboutMe,
  interestedIn,
  purpose,
  withMedia = true,
}) => ({
  email,
  username,
  firstname,
  lastname,
  password: TEST_ACCOUNT_PASSWORD,
  photoUrl: withMedia ? generateProfileCover(gender)[0].url : "",
  profileCover: withMedia ? generateProfileCover(gender) : [],
  settings: {
    theme: "light",
    emailNotification: true,
    showOnlineStatus: true,
  },
  bio: {
    gender,
    fullname: `${firstname} ${lastname}`,
    age,
    city,
    residentCountry,
    nationality: residentCountry,
    aboutMe,
    interestedIn,
    language: "English",
    height: 5.8,
    weight: 62.5,
    ethnicity: "Mixed race",
    hairColor: "Black",
    hairLength: "Medium",
    eyeColor: "Brown",
    travel: "Country Wide",
    smoking: "No",
    tatoo: "No",
    piercing: "No",
    purpose,
  },
});

export const credentialTestAccounts = [
  buildCredentialAccount({
    email: "demo.user@gsh.dev",
    username: "demo_user",
    firstname: "Demo",
    lastname: "User",
    gender: "Female",
    age: 27,
    city: "Lagos",
    residentCountry: "Nigeria",
    aboutMe:
      "The default integration account. Fully verified, owns a profile cover gallery and is safe to mutate while wiring up a client.",
    interestedIn: "Anyone",
    purpose: "General integration and happy path testing",
  }),
  buildCredentialAccount({
    email: "demo.female@gsh.dev",
    username: "demo_female",
    firstname: "Amara",
    lastname: "Okafor",
    gender: "Female",
    age: 24,
    city: "Abuja",
    residentCountry: "Nigeria",
    aboutMe:
      "A profile rich female account used to exercise discovery filters, bio driven search and profile cover rendering.",
    interestedIn: "Man",
    purpose: "Discovery, filtering and profile rendering",
  }),
  buildCredentialAccount({
    email: "demo.male@gsh.dev",
    username: "demo_male",
    firstname: "Daniel",
    lastname: "Adeyemi",
    gender: "Male",
    age: 31,
    city: "London",
    residentCountry: "United Kingdom",
    aboutMe:
      "A profile rich male account used to exercise discovery filters, bio driven search and profile cover rendering.",
    interestedIn: "Woman",
    purpose: "Discovery, filtering and profile rendering",
  }),
  buildCredentialAccount({
    email: "demo.empty@gsh.dev",
    username: "demo_empty",
    firstname: "Blank",
    lastname: "Profile",
    gender: "Male",
    age: 22,
    city: "Toronto",
    residentCountry: "Canada",
    aboutMe:
      "A freshly created account used to verify empty states, onboarding prompts and profile completion flows.",
    interestedIn: "Anyone",
    purpose: "Empty state and onboarding testing",
    withMedia: false,
  }),
];

export const providerTestAccounts = [
  {
    email: "demo.google@gsh.dev",
    username: "demo_google",
    firstname: "Google",
    lastname: "Tester",
    provider: "google",
    photoUrl: "",
    profileCover: [],
    bio: {
      gender: "Female",
      fullname: "Google Tester",
      age: 29,
      city: "New York City",
      residentCountry: "United States",
      aboutMe:
        "Signs in through the google provider branch. Password and password recovery endpoints are intentionally rejected for this account.",
      interestedIn: "Anyone",
    },
    settings: {},
  },
];

export const testAccountDirectory = [
  ...credentialTestAccounts.map((account) => ({
    email: account.email,
    username: account.username,
    fullname: account.bio.fullname || `${account.firstname} ${account.lastname}`,
    password: TEST_ACCOUNT_PASSWORD,
    provider: null,
    signInMethod: "Email and password",
    purpose: account.bio.purpose || "Integration testing",
  })),
  ...providerTestAccounts.map((account) => ({
    email: account.email,
    username: account.username,
    fullname: account.bio.fullname,
    password: null,
    provider: account.provider,
    signInMethod: 'Provider sign in with "provider": "google"',
    purpose: "Federated sign in and provider guard testing",
  })),
  {
    email: buildSandboxAccountEmail(1),
    username: null,
    fullname: "Generated sandbox profile",
    password: null,
    provider: "sandbox",
    signInMethod: 'Sandbox sign in with "provider": "sandbox"',
    purpose: `One of ${SANDBOX_ACCOUNT_TOTAL} generated demo profiles, addressable as testUser1@sandbox.com through testUser${SANDBOX_ACCOUNT_TOTAL}@sandbox.com`,
  },
];
