export const allowedOrigins = [
  "https://www.breezeup.me",
  "https://sgh-dating-ui.vercel.app/",
  "https://sgh-dating-app.netlify.app/",
  "http://localhost:3000",
];

export const isProdMode =
  process.env.NODE_ENV === "production" ||
  process.env.ENVIRONMENT === "production";

export const SERVER_ORIGIN = isProdMode
  ? "https://sgh-dating-api.glitch.me"
  : "http://localhost:10000";

export const APP_NAME = "SGH Dating";

export const HTTP_MSG_CODE_EXPIRED = "Verification code expired";

export const HTTP_CODE_CODE_EXPIRED = "VERIFICATION_CODE_EXPIRED";

export const HTTP_CODE_VALIDATION_ERROR = "ValidationError";

export const HTTP_CODE_INVALID_USER_ACCOUNT = "INVALID_USER_ACCOUNT";

export const HTTP_MSG_INVALID_USER_ACCOUNT = "Invalid user account";

export const HTTP_MSG_UNAUTHORIZE_ACCESS = "Authroization access denied";

export const HTTP_CODE_UNAUTHORIZE_ACCESS = "UNAUTHORIZE_ACCESS";

export const HTTP_CODE_UNVERIFIED_EMAIL = "UNVERIFIED_EMAIL";

export const HTTP_CODE_INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR";

export const MAIL_CONST = {
  user: "soulmatergsh@gmail.com",
  otherUser: "marvellousabidemi2@gmail.com",
  service: "Gmail",
};

export const HTTP_CODE_MAIL_ERROR = "_MAIL_ERROR";

export const HTTP_MSG_INVALID_VERIFICATION_CODE = "Invalid verification code!";

export const HTTP_MSG_INVALID_VERIFICAATION_CODE_REASON =
  "Invalid request reason. Expect either account | password-reset";

export const HTTP_MSG_USER_EXISTS =
  "A user with the specified email or username exists";

export const INVALID_DEMO_DOC_CREATION = "INVALID_DEMO_DOC_CREATION";

export const COOKIE_KEY_ACCESS_TOKEN = "access_token";

export const COOKIE_KEY_REFRESH_TOKEN = "refresh_token";

export const HTTP_MULTER_NAME_ERROR = "LIMIT_UNEXPECTED_FILE";

export const SESSION_COOKIE_DURATION = {
  shortLived: {
    duration: 5,
    type: "m",
    extend: 25,
  },
  accessToken: {
    extend: 24,
    duration: 1,
    type: "h",
  },
  refreshToken: {
    extend: 28,
    duration: 1,
    type: "d",
  },
};

export const cookieConfig = {
  httpOnly: true,
  sameSite: "None",
  secure: true, // Must be true for SameSite=None
  path: "/",
};

export const PWD_RESET = "password-reset";

export const HTTP_MSG_403 = "Forbidden access. Please login again";
