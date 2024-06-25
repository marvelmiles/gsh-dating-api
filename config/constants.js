import { isProdMode } from "../utils/validators";

export const CLIENT_ORIGIN = isProdMode
  ? "https://localhost:3000"
  : "http://localhost:3000";

export const SERVER_ORIGIN = isProdMode
  ? "https://brotherhood-api-8be5.onrender.com"
  : "http://localhost:8800";

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
  user: "caltextrader@gmail.com",
};

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
  },
  accessToken: {
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
  sameSite: "Strict",
  secure: isProdMode,
};

export const PWD_RESET = "password-reset";
