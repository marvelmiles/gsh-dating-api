import {
  COOKIE_KEY_ACCESS_TOKEN,
  COOKIE_KEY_REFRESH_TOKEN,
} from "../../config/constants";

export const securitySchemes = {
  accessTokenCookie: {
    type: "apiKey",
    in: "cookie",
    name: COOKIE_KEY_ACCESS_TOKEN,
    description:
      "Short lived JWT set by POST /api/auth/signin. Sent automatically by the browser, so every request must be issued with credentials included. Lifetime is 1 hour, or 24 hours when signing in with rememberMe=true.",
  },
  refreshTokenCookie: {
    type: "apiKey",
    in: "cookie",
    name: COOKIE_KEY_REFRESH_TOKEN,
    description:
      "Long lived JWT read only by GET /api/auth/refresh-token. Lifetime is 1 day, or 28 days when signing in with rememberMe=true.",
  },
};

export const protectedRouteSecurity = [{ accessTokenCookie: [] }];
