export const parameters = {
  UserIdPath: {
    name: "userId",
    in: "path",
    required: true,
    description: "MongoDB ObjectId of the target user.",
    schema: { type: "string", example: "66c9f0b1a4d2e51f3c7b8a10" },
  },
  VerificationReasonPath: {
    name: "reason",
    in: "path",
    required: true,
    description:
      "Which flow the code belongs to. Use account for signup email verification and password-reset for password recovery.",
    schema: {
      type: "string",
      enum: ["account", "password-reset"],
      example: "account",
    },
  },
  RememberMeQuery: {
    name: "rememberMe",
    in: "query",
    required: false,
    description:
      "When true the session cookies are issued with their extended lifetime, 24 hours for the access token and 28 days for the refresh token, instead of 1 hour and 1 day.",
    schema: { type: "boolean", default: false },
  },
  PageQuery: {
    name: "page",
    in: "query",
    required: false,
    description: "One based page number.",
    schema: { type: "integer", minimum: 1, default: 1 },
  },
  LimitQuery: {
    name: "limit",
    in: "query",
    required: false,
    description:
      "Documents per page. Pass the literal string all to disable paging and return every match in one response.",
    schema: {
      oneOf: [{ type: "integer", minimum: 1 }, { type: "string", enum: ["all"] }],
      default: 10,
    },
  },
  SearchTermQuery: {
    name: "q",
    in: "query",
    required: false,
    description:
      "Case insensitive term matched against firstname, lastname and username, plus any bio key named in the bio parameter.",
    schema: { type: "string", example: "amara" },
  },
  BioKeysQuery: {
    name: "bio",
    in: "query",
    required: false,
    description:
      "Extra bio keys the q term should be matched against. Pass a space separated string or repeat the parameter as an array.",
    schema: {
      oneOf: [
        { type: "string", example: "aboutMe city nationality" },
        { type: "array", items: { type: "string" } },
      ],
    },
  },
  BioFilterQuery: {
    name: "filter",
    in: "query",
    required: false,
    style: "deepObject",
    explode: true,
    description:
      "Exact match filters applied to bio keys. Sent as filter[key]=value, for example filter[gender]=Female&filter[city]=Abuja.",
    schema: { type: "object", additionalProperties: true },
  },
  StrictSearchQuery: {
    name: "strictSearch",
    in: "query",
    required: false,
    description:
      "When true every term and filter must match, an AND. When false, the default, a document matching any one of them is returned, an OR ranked by relevance.",
    schema: { type: "boolean", default: false },
  },
  SortRelevanceQuery: {
    name: "sortRelevance",
    in: "query",
    required: false,
    style: "deepObject",
    explode: true,
    description:
      "Ranks results by preferred values for a field. Sent as sortRelevance[bio.city]=Abuja&sortRelevance[bio.city]=Lagos, where earlier values rank higher.",
    schema: { type: "object", additionalProperties: true },
  },
  ExcludeUserIdsQuery: {
    name: "searchUid",
    in: "query",
    required: false,
    description:
      "Space separated user ids to exclude from the results. Useful for hiding the signed in user or profiles already swiped.",
    schema: { type: "string", example: "66c9f0b1a4d2e51f3c7b8a10" },
  },
  UploadFieldNameQuery: {
    name: "fieldName",
    in: "query",
    required: false,
    description:
      "Overrides the multipart field name the server reads the upload from.",
    schema: { type: "string", default: "avatar" },
  },
  UploadMaxCountQuery: {
    name: "maxCount",
    in: "query",
    required: false,
    description: "Overrides the maximum number of files accepted.",
    schema: { type: "integer", minimum: 1 },
  },
  UploadMaxSizeQuery: {
    name: "maxSize",
    in: "query",
    required: false,
    description:
      "Per file byte ceiling. Capped at 5000000000 bytes regardless of the value sent.",
    schema: { type: "integer", example: 10485760 },
  },
  SequentialUploadQuery: {
    name: "sequentialEffect",
    in: "query",
    required: false,
    description:
      "When true the first failed file aborts the whole upload. When false, the default, the remaining files still upload and the failures are reported together.",
    schema: { type: "boolean", default: false },
  },
};
