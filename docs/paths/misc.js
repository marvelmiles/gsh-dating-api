import { buildSuccessResponse } from "../components/responses";

const errorRef = (name) => ({ $ref: `#/components/responses/${name}` });

export const miscPaths = {
  "/api/search": {
    get: {
      tags: ["Discovery"],
      summary: "Search across resources",
      operationId: "search",
      description: `Runs the same matching engine as GET /api/users but returns each resource under its own key, so one request can back a combined search screen.

Choose the resources with \`select\`, a space separated list. Only \`users\` is available today, and it is the default, so the response shape is \`{ "data": { "users": { ... } } }\`.

Every filtering and pagination parameter documented on GET /api/users applies here unchanged.`,
      parameters: [
        {
          name: "select",
          in: "query",
          required: false,
          description:
            "Space separated resource keys to search. Unknown keys are rejected with a 400.",
          schema: { type: "string", default: "users", example: "users" },
        },
        { $ref: "#/components/parameters/SearchTermQuery" },
        { $ref: "#/components/parameters/BioKeysQuery" },
        { $ref: "#/components/parameters/BioFilterQuery" },
        { $ref: "#/components/parameters/StrictSearchQuery" },
        { $ref: "#/components/parameters/SortRelevanceQuery" },
        { $ref: "#/components/parameters/ExcludeUserIdsQuery" },
        { $ref: "#/components/parameters/PageQuery" },
        { $ref: "#/components/parameters/LimitQuery" },
      ],
      responses: {
        200: buildSuccessResponse("Results grouped by resource.", {
          type: "object",
          properties: {
            users: { $ref: "#/components/schemas/PaginatedUsers" },
          },
        }),
        400: errorRef("BadRequest"),
        500: errorRef("ServerError"),
      },
    },
  },

  "/api/feedback": {
    post: {
      tags: ["Support"],
      summary: "Send feedback to support",
      operationId: "mailFeedback",
      description:
        "Delivers a message to the support inbox with the sender address attached. Unauthenticated, so it can back a contact form on a public page.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "message"],
              properties: {
                email: {
                  type: "string",
                  format: "email",
                  description: "Reply address for the sender.",
                },
                message: { type: "string" },
              },
            },
            example: {
              email: "demo.user@gsh.dev",
              message:
                "The profile cover gallery does not reorder on mobile Safari.",
            },
          },
        },
      },
      responses: {
        200: buildSuccessResponse(
          "The message was delivered.",
          null,
          "Thank you for your feedback!"
        ),
        400: errorRef("BadRequest"),
      },
    },
  },
};
