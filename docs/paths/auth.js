import { buildSuccessResponse } from "../components/responses";
import { protectedRouteSecurity } from "../components/securitySchemes";
import { signInExamples } from "../testAccounts";

const userSchemaRef = { $ref: "#/components/schemas/User" };

const errorRef = (name) => ({ $ref: `#/components/responses/${name}` });

export const authPaths = {
  "/api/auth/signup": {
    post: {
      tags: ["Authentication"],
      summary: "Create an account",
      operationId: "signup",
      description: `Creates a password account, a federated account, or a sandbox profile.

Send JSON for a plain signup. Send \`multipart/form-data\` when you also want to set the avatar in the same call, putting the image in the \`avatar\` field and every other value alongside it as form fields.

The password must be at least 8 characters and contain an uppercase letter, a lowercase letter, a number and a symbol. A weak password comes back as a 400 naming exactly what is missing.

The email must be unique. A username collision is only rejected for password accounts. For federated accounts a numeric suffix is appended automatically until the username is free.`,
      parameters: [
        { $ref: "#/components/parameters/UploadFieldNameQuery" },
        { $ref: "#/components/parameters/UploadMaxSizeQuery" },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email"],
              properties: {
                email: { type: "string", format: "email" },
                password: {
                  type: "string",
                  format: "password",
                  minLength: 8,
                  description:
                    "Required unless provider is set. Must contain an uppercase letter, a lowercase letter, a number and a symbol.",
                },
                username: { type: "string" },
                firstname: { type: "string" },
                lastname: { type: "string" },
                photoUrl: { type: "string", format: "uri" },
                provider: { type: "string", enum: ["google", "sandbox"] },
                bio: { $ref: "#/components/schemas/UserBio" },
                settings: { $ref: "#/components/schemas/UserSettings" },
              },
            },
            examples: {
              passwordAccount: {
                summary: "Password account",
                value: {
                  email: "ada.lovelace@example.com",
                  username: "ada_lovelace",
                  firstname: "Ada",
                  lastname: "Lovelace",
                  password: "Str0ng@Pass",
                  bio: { gender: "Female", age: 28, city: "Lagos" },
                },
              },
              federatedAccount: {
                summary: "Google account",
                description:
                  "No password is stored. The username is made unique automatically.",
                value: {
                  email: "ada.lovelace@gmail.com",
                  username: "ada",
                  firstname: "Ada",
                  provider: "google",
                  photoUrl: "https://lh3.googleusercontent.com/a/example",
                },
              },
            },
          },
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["email"],
              properties: {
                avatar: {
                  type: "string",
                  format: "binary",
                  description: "Profile photo. Images only.",
                },
                email: { type: "string", format: "email" },
                password: { type: "string", format: "password" },
                username: { type: "string" },
                firstname: { type: "string" },
                lastname: { type: "string" },
                bio: {
                  type: "string",
                  description: "JSON encoded bio object.",
                },
                settings: {
                  type: "string",
                  description: "JSON encoded settings object.",
                },
              },
            },
          },
        },
      },
      responses: {
        200: buildSuccessResponse(
          "The account was created. The user is returned but no session cookies are set, so follow this call with a sign in.",
          userSchemaRef
        ),
        400: errorRef("BadRequest"),
        500: errorRef("ServerError"),
      },
    },
  },

  "/api/auth/signin": {
    post: {
      tags: ["Authentication", "Test accounts"],
      summary: "Sign in and open a session",
      operationId: "signin",
      description: `Authenticates and sets the \`access_token\` and \`refresh_token\` cookies. Both are \`HttpOnly\`, \`Secure\` and \`SameSite=None\`, so your client must send every subsequent request with credentials included.

The identity field is flexible. Send \`email\`, or send \`username\`, or send \`placeholder\` when a single input on your form accepts either.

Three sign in modes are supported:

- **Password.** Send \`email\` or \`username\` together with \`password\`.
- **Google.** Send \`provider: "google"\` with the email from the identity provider. The account is created on first use.
- **Sandbox.** Send \`provider: "sandbox"\` with the email of a seeded demo profile, or with no email at all to be signed in as a random one.

Pick any seeded account from the **Examples** dropdown below to sign in as it directly from this page.`,
      parameters: [{ $ref: "#/components/parameters/RememberMeQuery" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                email: { type: "string", format: "email" },
                username: { type: "string" },
                placeholder: {
                  type: "string",
                  description:
                    "An email or a username. Takes precedence over both fields above.",
                },
                password: { type: "string", format: "password" },
                provider: { type: "string", enum: ["google", "sandbox"] },
                firstname: {
                  type: "string",
                  description:
                    "Only used when a google account is created on first sign in.",
                },
                lastname: {
                  type: "string",
                  description:
                    "Only used when a google account is created on first sign in.",
                },
              },
            },
            examples: signInExamples,
          },
        },
      },
      responses: {
        200: buildSuccessResponse(
          "Signed in. Session cookies are set on this response.",
          userSchemaRef
        ),
        400: errorRef("BadRequest"),
        403: {
          description: `Sign in was refused. Branch on the error code:

- \`UNVERIFIED_EMAIL\` means the signup email was never verified, so send the user to the verification screen and call POST /api/auth/generate-new-token/account.
- \`UNAUTHORIZE_ACCESS\` means the email belongs to a federated account, so prompt the user to continue with Google instead.`,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorEnvelope" },
              examples: {
                unverifiedEmail: {
                  summary: "Email not verified",
                  value: {
                    message: "Login denied. Your account isn't verified.",
                    code: "UNVERIFIED_EMAIL",
                    success: false,
                    status: 403,
                    statusCode: 403,
                    timestamp: "2026-08-27T09:41:12.804Z",
                  },
                },
                federatedAccount: {
                  summary: "Account belongs to a provider",
                  value: {
                    message: "Authroization access denied",
                    code: "UNAUTHORIZE_ACCESS",
                    success: false,
                    status: 403,
                    statusCode: 403,
                    timestamp: "2026-08-27T09:41:12.804Z",
                  },
                },
              },
            },
          },
        },
        500: errorRef("ServerError"),
      },
    },
  },

  "/api/auth/signout": {
    patch: {
      tags: ["Authentication"],
      summary: "Sign out and clear the session",
      operationId: "signout",
      security: protectedRouteSecurity,
      description:
        "Expires both session cookies and marks the account offline. Any settings sent in the body are merged into the profile first, which lets you persist a preference change on the way out.",
      requestBody: {
        required: false,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                settings: { $ref: "#/components/schemas/UserSettings" },
              },
            },
            example: { settings: { theme: "dark" } },
          },
        },
      },
      responses: {
        200: buildSuccessResponse(
          "Signed out.",
          null,
          "You just got signed out!"
        ),
        401: errorRef("Unauthorized"),
        500: errorRef("ServerError"),
      },
    },
  },

  "/api/auth/refresh-token": {
    get: {
      tags: ["Authentication"],
      summary: "Refresh an expired access token",
      operationId: "refreshTokens",
      security: [{ refreshTokenCookie: [] }],
      description:
        "Issues a fresh access token cookie from the refresh token cookie. Call this once when any endpoint answers 401, then retry the original request. A 403 here means the refresh token is gone too, so send the user back to sign in.",
      parameters: [{ $ref: "#/components/parameters/RememberMeQuery" }],
      responses: {
        200: buildSuccessResponse(
          "A new access token cookie was set.",
          null,
          "Access token refreshed"
        ),
        403: errorRef("Forbidden"),
      },
    },
  },

  "/api/auth/user-exists/{userId}": {
    get: {
      tags: ["Authentication"],
      summary: "Check whether an account exists",
      operationId: "userExists",
      description:
        "Returns true or false in the data field. Use it for live availability checks on a signup form.",
      parameters: [{ $ref: "#/components/parameters/UserIdPath" }],
      responses: {
        200: buildSuccessResponse("The lookup ran.", {
          type: "boolean",
          example: true,
        }),
        403: errorRef("Forbidden"),
        500: errorRef("ServerError"),
      },
    },
  },

  "/api/auth/generate-new-token/{reason}": {
    post: {
      tags: ["Authentication"],
      summary: "Send a verification code by email",
      operationId: "generateUserToken",
      description: `Emails a 4 digit code to the account and gives it a 25 minute lifetime. Use \`account\` to verify a new signup and \`password-reset\` to start a password change for a signed in user.

Identify the account with any one of \`userId\`, \`email\`, \`username\` or \`placeholder\` in the body.`,
      parameters: [{ $ref: "#/components/parameters/VerificationReasonPath" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                email: { type: "string", format: "email" },
                userId: { type: "string" },
                username: { type: "string" },
                placeholder: { type: "string" },
              },
            },
            example: { email: "demo.user@gsh.dev" },
          },
        },
      },
      responses: {
        200: buildSuccessResponse(
          "The code was sent. The data field carries the user id you need for the verification call.",
          {
            type: "object",
            properties: {
              id: { type: "string", example: "66c9f0b1a4d2e51f3c7b8a10" },
            },
          }
        ),
        400: errorRef("BadRequest"),
        403: errorRef("Forbidden"),
        428: errorRef("PreconditionRequired"),
        503: errorRef("MailServiceUnavailable"),
      },
    },
  },

  "/api/auth/verify-token/{reason}": {
    post: {
      tags: ["Authentication"],
      summary: "Verify a code from an email",
      operationId: "verifyUserToken",
      description: `Confirms the 4 digit code that was emailed to the account.

With \`account\` the signup email is marked verified and the account lockout is lifted.

With \`password-reset\` the code is exchanged for a 25 minute window during which POST /api/auth/reset-password will accept a new password without the code.`,
      parameters: [{ $ref: "#/components/parameters/VerificationReasonPath" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["code"],
              properties: {
                code: { type: "string", example: "4821" },
                userId: { type: "string" },
                email: { type: "string", format: "email" },
                username: { type: "string" },
                placeholder: { type: "string" },
              },
            },
            example: { userId: "66c9f0b1a4d2e51f3c7b8a10", code: "4821" },
          },
        },
      },
      responses: {
        200: buildSuccessResponse(
          "The code was accepted.",
          null,
          "Account verified successfully!"
        ),
        400: {
          description:
            "The code is wrong or expired. A code of VERIFICATION_CODE_EXPIRED means you should offer to resend rather than retry.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorEnvelope" },
              examples: {
                invalidCode: {
                  summary: "Wrong code",
                  value: {
                    message: "Invalid verification code!",
                    code: "ValidationError",
                    success: false,
                    status: 400,
                    statusCode: 400,
                    timestamp: "2026-08-27T09:41:12.804Z",
                  },
                },
                expiredCode: {
                  summary: "Expired code",
                  value: {
                    message: "Verification code expired",
                    code: "VERIFICATION_CODE_EXPIRED",
                    success: false,
                    status: 400,
                    statusCode: 400,
                    timestamp: "2026-08-27T09:41:12.804Z",
                  },
                },
              },
            },
          },
        },
        403: errorRef("Forbidden"),
      },
    },
  },

  "/api/auth/recover-password": {
    post: {
      tags: ["Authentication"],
      summary: "Start a password recovery",
      operationId: "recoverPwd",
      description:
        "Emails a password reset code to an account the user cannot sign into. Federated accounts are rejected with UNAUTHORIZE_ACCESS because they have no password to reset.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                email: { type: "string", format: "email" },
                username: { type: "string" },
                placeholder: { type: "string" },
              },
            },
            example: { email: "demo.user@gsh.dev" },
          },
        },
      },
      responses: {
        200: buildSuccessResponse("The reset code was sent.", {
          type: "object",
          properties: {
            id: { type: "string", example: "66c9f0b1a4d2e51f3c7b8a10" },
          },
        }),
        403: errorRef("Forbidden"),
        503: errorRef("MailServiceUnavailable"),
      },
    },
  },

  "/api/auth/reset-password": {
    post: {
      tags: ["Authentication"],
      summary: "Set a new password",
      operationId: "resetPwd",
      description: `Completes a recovery. There are two ways to call it.

Send \`userId\`, \`code\` and \`password\` to verify and reset in one step.

Or verify the code first with POST /api/auth/verify-token/password-reset and then send just \`userId\` and \`password\` within the 25 minute window that call opens.

Either way the reset window must still be open, otherwise the response is VERIFICATION_CODE_EXPIRED.`,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["userId", "password"],
              properties: {
                userId: { type: "string" },
                password: {
                  type: "string",
                  format: "password",
                  minLength: 8,
                },
                code: {
                  type: "string",
                  description:
                    "Only needed when the code was not verified in a separate call.",
                },
              },
            },
            examples: {
              singleStep: {
                summary: "Verify and reset together",
                value: {
                  userId: "66c9f0b1a4d2e51f3c7b8a10",
                  code: "4821",
                  password: "N3w@Password",
                },
              },
              afterVerification: {
                summary: "Reset inside an already opened window",
                value: {
                  userId: "66c9f0b1a4d2e51f3c7b8a10",
                  password: "N3w@Password",
                },
              },
            },
          },
        },
      },
      responses: {
        200: buildSuccessResponse(
          "The password was changed. The user can sign in with it immediately.",
          null,
          "Password reset successful"
        ),
        400: errorRef("BadRequest"),
        403: errorRef("Forbidden"),
      },
    },
  },
};
