const buildErrorResponse = (description, example) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorEnvelope" },
      example,
    },
  },
});

export const buildSuccessResponse = (description, dataSchema, message) => ({
  description,
  content: {
    "application/json": {
      schema: {
        allOf: [
          { $ref: "#/components/schemas/SuccessEnvelope" },
          dataSchema
            ? { type: "object", properties: { data: dataSchema } }
            : { type: "object" },
        ],
      },
      ...(message
        ? {
            example: {
              code: "REQUEST_OK",
              success: true,
              status: 200,
              statusCode: 200,
              message,
              timestamp: "2026-08-27T09:41:12.804Z",
            },
          }
        : {}),
    },
  },
});

export const responses = {
  BadRequest: buildErrorResponse(
    "The request body, params or query failed validation.",
    {
      message: "Invalid request. New password is required.",
      code: "BAD_REQUEST",
      success: false,
      status: 400,
      statusCode: 400,
      timestamp: "2026-08-27T09:41:12.804Z",
    }
  ),
  Unauthorized: buildErrorResponse(
    "No access token cookie was sent, or the token has expired. Call GET /api/auth/refresh-token and retry once.",
    {
      message: "Authroization access denied",
      code: "UNAUTHORIZED_ACCESS",
      success: false,
      status: 401,
      statusCode: 401,
      timestamp: "2026-08-27T09:41:12.804Z",
    }
  ),
  Forbidden: buildErrorResponse(
    "The session is valid but the action is not permitted for this account, or the refresh token itself has expired.",
    {
      message: "Forbidden access. Please login again",
      code: "FORBIDDEN_ACCESSS",
      success: false,
      status: 403,
      statusCode: 403,
      timestamp: "2026-08-27T09:41:12.804Z",
    }
  ),
  NotFound: buildErrorResponse("No matching resource exists.", {
    message: "Authroization access denied",
    code: "UNAUTHORIZE_ACCESS",
    success: false,
    status: 403,
    statusCode: 403,
    timestamp: "2026-08-27T09:41:12.804Z",
  }),
  PreconditionRequired: buildErrorResponse(
    "The account must verify its signup email before this action is allowed.",
    {
      message:
        "Unable to process or generate a verification token for an unverified account!",
      code: "UNVERIFIED_EMAIL",
      success: false,
      status: 428,
      statusCode: 428,
      timestamp: "2026-08-27T09:41:12.804Z",
    }
  ),
  ServerError: buildErrorResponse(
    "Something failed on the server. Safe to retry.",
    {
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
      success: false,
      status: 500,
      statusCode: 500,
      timestamp: "2026-08-27T09:41:12.804Z",
    }
  ),
  MailServiceUnavailable: buildErrorResponse(
    "The mail transport rejected the message. The verification code was not sent.",
    {
      message: "Encountered an error, while sending your message",
      code: "_MAIL_ERROR",
      success: false,
      status: 503,
      statusCode: 503,
      timestamp: "2026-08-27T09:41:12.804Z",
    }
  ),
};
