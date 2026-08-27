import { buildSuccessResponse } from "../components/responses";
import { protectedRouteSecurity } from "../components/securitySchemes";

const errorRef = (name) => ({ $ref: `#/components/responses/${name}` });

const searchParameters = [
  { $ref: "#/components/parameters/SearchTermQuery" },
  { $ref: "#/components/parameters/BioKeysQuery" },
  { $ref: "#/components/parameters/BioFilterQuery" },
  { $ref: "#/components/parameters/StrictSearchQuery" },
  { $ref: "#/components/parameters/SortRelevanceQuery" },
  { $ref: "#/components/parameters/ExcludeUserIdsQuery" },
  { $ref: "#/components/parameters/PageQuery" },
  { $ref: "#/components/parameters/LimitQuery" },
];

export const userPaths = {
  "/api/users": {
    get: {
      tags: ["Users", "Discovery"],
      summary: "List and search users",
      operationId: "getAllUsers",
      description: `The main feed endpoint. Returns a paginated page of profiles, optionally narrowed by a search term and by exact bio filters.

**How matching works.** By default the term and the filters are combined with OR and results are ranked so that documents matching more of them come first. Set \`strictSearch=true\` to require every condition instead.

**Searching inside bios.** The term only reaches \`firstname\`, \`lastname\` and \`username\` unless you name the extra bio keys, for example \`bio=aboutMe city nationality\`.

**Filtering.** Filters are exact matches on bio keys, sent as \`filter[gender]=Female&filter[residentCountry]=Nigeria\`.

**Excluding profiles.** Pass the ids the user has already seen in \`searchUid\` to keep an infinite feed from repeating itself.

Requests are unauthenticated, so this endpoint can back a public landing page.`,
      parameters: searchParameters,
      responses: {
        200: buildSuccessResponse("A page of profiles.", {
          $ref: "#/components/schemas/PaginatedUsers",
        }),
        400: errorRef("BadRequest"),
        500: errorRef("ServerError"),
      },
    },
  },

  "/api/users/{userId}": {
    get: {
      tags: ["Users"],
      summary: "Get one user",
      operationId: "getUserById",
      description:
        "Returns a single profile. The data field is null when no user carries that id, so treat a null payload as a 404 in your client.",
      parameters: [{ $ref: "#/components/parameters/UserIdPath" }],
      responses: {
        200: buildSuccessResponse("The profile, or null when it is missing.", {
          allOf: [{ $ref: "#/components/schemas/User" }],
          nullable: true,
        }),
        400: errorRef("BadRequest"),
        500: errorRef("ServerError"),
      },
    },
    put: {
      tags: ["Users"],
      summary: "Update a profile",
      operationId: "updateUserById",
      security: protectedRouteSecurity,
      description: `Updates the profile and optionally replaces the avatar in the same call.

Send \`multipart/form-data\` with the image in the \`avatar\` field to change the photo, or plain JSON when there is no file. When a new avatar uploads successfully the previous one is deleted from storage afterwards.

\`bio\` and \`settings\` are merged key by key, so sending \`{ "bio": { "city": "Lagos" } }\` changes only the city and leaves the rest of the bio intact. There is no way to clear a single bio key, set it to an empty value instead.

Send \`deleteAvatar: true\` to remove the current photo without uploading a replacement.`,
      parameters: [
        { $ref: "#/components/parameters/UserIdPath" },
        { $ref: "#/components/parameters/UploadFieldNameQuery" },
        { $ref: "#/components/parameters/UploadMaxSizeQuery" },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                firstname: { type: "string" },
                lastname: { type: "string" },
                username: { type: "string" },
                photoUrl: { type: "string", format: "uri" },
                deleteAvatar: { type: "boolean" },
                bio: { $ref: "#/components/schemas/UserBio" },
                settings: { $ref: "#/components/schemas/UserSettings" },
              },
            },
            examples: {
              partialBio: {
                summary: "Change two bio keys",
                value: {
                  bio: { city: "Lagos", interestedIn: "Anyone" },
                },
              },
              preferences: {
                summary: "Persist a preference",
                value: { settings: { theme: "dark" } },
              },
              removeAvatar: {
                summary: "Remove the avatar",
                value: { deleteAvatar: true },
              },
            },
          },
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                avatar: {
                  type: "string",
                  format: "binary",
                  description: "New profile photo. Images only.",
                },
                firstname: { type: "string" },
                lastname: { type: "string" },
                username: { type: "string" },
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
        200: buildSuccessResponse("The updated profile.", {
          $ref: "#/components/schemas/User",
        }),
        400: errorRef("BadRequest"),
        401: errorRef("Unauthorized"),
        403: errorRef("Forbidden"),
        500: errorRef("ServerError"),
      },
    },
  },

  "/api/users/update-profile-cover/{userId}": {
    put: {
      tags: ["Users"],
      summary: "Manage the profile cover gallery",
      operationId: "updateProfileCover",
      security: protectedRouteSecurity,
      description: `Maintains the ordered gallery of up to 6 images and videos shown on a profile. Always sent as \`multipart/form-data\` with the files in the \`profileCover\` field.

The call supports three shapes:

**Replace the whole gallery.** Upload files and send no \`delIndex\` or \`updateIndex\`. Everything currently stored is deleted and the upload becomes the new gallery.

**Replace specific slots.** Send \`updateIndex\` as a map of gallery position to upload position, so \`{"0":0,"2":1}\` puts the first uploaded file in slot 0 and the second in slot 2. The files that were in those slots are deleted from storage.

**Delete slots.** Send \`delIndex\` as an array of gallery positions to remove, for example \`[1,3]\`. This can be combined with an upload or sent on its own with no files at all.

Both fields may be sent as JSON encoded form fields or as query parameters. Deletions are applied before updates, so index against the gallery as it will look after the deletions.

By default an \`updateIndex\` slot beyond the end of the gallery is rejected. Pass \`strictMode=false\` to let it grow the gallery instead.`,
      parameters: [
        { $ref: "#/components/parameters/UserIdPath" },
        {
          name: "strictMode",
          in: "query",
          required: false,
          description:
            "When true, the default, an updateIndex beyond the current gallery length is rejected.",
          schema: { type: "boolean", default: true },
        },
        {
          name: "updateIndex",
          in: "query",
          required: false,
          style: "deepObject",
          explode: true,
          description:
            "Alternative to the form field. Maps a gallery position to an upload position.",
          schema: { type: "object", additionalProperties: { type: "integer" } },
        },
        {
          name: "delIndex",
          in: "query",
          required: false,
          description:
            "Alternative to the form field. Gallery positions to remove.",
          schema: { type: "array", items: { type: "integer" } },
        },
        { $ref: "#/components/parameters/UploadMaxCountQuery" },
        { $ref: "#/components/parameters/UploadMaxSizeQuery" },
        { $ref: "#/components/parameters/SequentialUploadQuery" },
      ],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                profileCover: {
                  type: "array",
                  maxItems: 6,
                  items: { type: "string", format: "binary" },
                  description: "Images or videos. Up to 6 files per request.",
                },
                updateIndex: {
                  type: "string",
                  description:
                    'JSON encoded map of gallery position to upload position, for example {"0":0,"2":1}.',
                },
                delIndex: {
                  type: "string",
                  description:
                    "JSON encoded array of gallery positions to remove, for example [1,3].",
                },
              },
            },
          },
        },
      },
      responses: {
        200: buildSuccessResponse("The profile with its updated gallery.", {
          $ref: "#/components/schemas/User",
        }),
        400: errorRef("BadRequest"),
        401: errorRef("Unauthorized"),
        403: errorRef("Forbidden"),
        500: errorRef("ServerError"),
      },
    },
  },
};
