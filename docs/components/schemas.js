const objectIdExample = "66c9f0b1a4d2e51f3c7b8a10";

const timestamp = {
  type: "string",
  format: "date-time",
  example: "2026-08-27T09:41:12.804Z",
};

const nullableDateTime = {
  type: "string",
  format: "date-time",
  nullable: true,
};

export const schemas = {
  Media: {
    type: "object",
    description: "A single image or video stored on Firebase.",
    properties: {
      url: {
        type: "string",
        format: "uri",
        example:
          "https://storage.googleapis.com/caltex-api.appspot.com/gsh-profile-covers/1724750472233-cover.jpg",
      },
      mimetype: { type: "string", example: "image/jpeg" },
      size: {
        type: "integer",
        description: "Size in bytes. Absent on seeded demo media.",
        example: 184320,
      },
    },
  },

  UserBio: {
    type: "object",
    description:
      "Free form profile attributes. Every key is optional and clients may introduce new keys, so treat this as a dictionary rather than a fixed shape. The keys listed here are the ones the seeded data and the search filters rely on. Rate card entries follow the pattern <duration>-incall and <duration>-outcall.",
    additionalProperties: true,
    properties: {
      fullname: { type: "string", example: "Amara Okafor" },
      gender: { type: "string", example: "Female" },
      age: { type: "integer", example: 24 },
      aboutMe: {
        type: "string",
        example:
          "I am a passionate traveler who has explored over 15 countries and counting.",
      },
      height: { type: "number", description: "Feet", example: 5.7 },
      weight: { type: "number", description: "Pounds", example: 61.4 },
      ethnicity: { type: "string", example: "Mixed race" },
      hairColor: { type: "string", example: "Black" },
      hairLength: { type: "string", example: "Medium" },
      eyeColor: { type: "string", example: "Brown" },
      nationality: { type: "string", example: "Nigeria" },
      residentCountry: { type: "string", example: "Nigeria" },
      city: { type: "string", example: "Abuja" },
      language: { type: "string", example: "English" },
      interestedIn: {
        type: "string",
        enum: ["Woman", "Man", "Couples", "Anyone"],
        example: "Man",
      },
      travel: { type: "string", example: "Country Wide" },
      smoking: { type: "string", enum: ["Yes", "No"], example: "No" },
      tatoo: { type: "string", enum: ["Yes", "No"], example: "No" },
      piercing: { type: "string", example: "No" },
      phone: { type: "string", example: "+234 803 214 8890" },
      whatsappID: { type: "string", format: "uri" },
      telegramID: { type: "string", format: "uri" },
      facebookID: { type: "string", format: "uri" },
      "1 Hour-incall": { type: "integer", example: 1200 },
      "1 Hour-outcall": { type: "integer", example: 1650 },
    },
  },

  UserSettings: {
    type: "object",
    description:
      "Client owned preference bag. Any primitive value is accepted and merged key by key, so a partial update never clears untouched keys.",
    additionalProperties: true,
    properties: {
      theme: { type: "string", example: "light" },
      emailNotification: { type: "boolean", example: true },
      showOnlineStatus: { type: "boolean", example: true },
    },
  },

  User: {
    type: "object",
    description:
      "A user profile. The password, resetToken and resetDate fields are stripped from every response.",
    properties: {
      id: { type: "string", example: objectIdExample },
      firstname: { type: "string", example: "Amara" },
      lastname: { type: "string", example: "Okafor" },
      fullname: {
        type: "string",
        description: "Virtual field derived from firstname and lastname.",
        example: "Amara Okafor",
      },
      username: { type: "string", example: "demo_female" },
      email: {
        type: "string",
        format: "email",
        example: "demo.female@gsh.dev",
      },
      photoUrl: { type: "string", format: "uri", nullable: true },
      profileCover: {
        type: "array",
        maxItems: 6,
        items: { $ref: "#/components/schemas/Media" },
      },
      bio: { $ref: "#/components/schemas/UserBio" },
      settings: { $ref: "#/components/schemas/UserSettings" },
      provider: {
        type: "string",
        nullable: true,
        enum: ["google", "sandbox", null],
        description:
          "Absent for password accounts. The value google marks a federated account and sandbox marks a generated test profile.",
      },
      isLogin: { type: "boolean", example: true },
      isTestUser: {
        type: "boolean",
        description: "Virtual field. True when provider is sandbox.",
        example: false,
      },
      expired: {
        type: "boolean",
        description:
          "Virtual field. True once accountExpires is in the past, meaning the signup email was never verified in time.",
        example: false,
      },
      referralCode: { type: "string", nullable: true, example: "4821" },
      referralLink: {
        type: "string",
        format: "uri",
        description: "Virtual field built from the server origin.",
        example: "https://sgh-dating-api.glitch.me?ref=4821",
      },
      referrals: {
        type: "array",
        items: { type: "string", example: objectIdExample },
      },
      kycDocs: { type: "object", additionalProperties: true },
      kycIds: { type: "object", additionalProperties: true },
      lastLogin: nullableDateTime,
      verifiedAt: nullableDateTime,
      mailVerifiedAt: nullableDateTime,
      accountExpires: {
        ...nullableDateTime,
        description:
          "When set and in the past the account is locked out until the signup email is verified.",
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  },

  Pagination: {
    type: "object",
    properties: {
      totalDocs: { type: "integer", example: 84 },
      totalPages: { type: "integer", example: 9 },
      currentPage: { type: "integer", example: 1 },
    },
  },

  PaginatedUsers: {
    allOf: [
      { $ref: "#/components/schemas/Pagination" },
      {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/User" },
          },
        },
      },
    ],
  },

  SuccessEnvelope: {
    type: "object",
    description:
      "Every successful response uses this envelope. Read your payload from the data field.",
    required: ["success", "code", "status", "message", "timestamp"],
    properties: {
      data: {
        description:
          "The payload. Undefined for endpoints that only acknowledge an action.",
      },
      code: { type: "string", example: "REQUEST_OK" },
      success: { type: "boolean", example: true },
      status: { type: "integer", example: 200 },
      statusCode: { type: "integer", example: 200 },
      message: { type: "string", example: "Request was successful" },
      timestamp,
    },
  },

  ErrorEnvelope: {
    type: "object",
    description:
      "Every failed response uses this envelope. Branch on code and show message to the user.",
    required: ["success", "message", "status", "code"],
    properties: {
      message: { type: "string", example: "Email or password is incorrect" },
      code: {
        type: "string",
        description:
          "Stable machine readable identifier. The full list lives in the Getting started section.",
        example: "INVALID_USER_ACCOUNT",
      },
      success: { type: "boolean", example: false },
      status: { type: "integer", example: 400 },
      statusCode: { type: "integer", example: 400 },
      details: {
        type: "object",
        nullable: true,
        additionalProperties: true,
        description: "Populated for upload and timeout failures only.",
      },
      timestamp,
    },
  },

  TestAccount: {
    type: "object",
    properties: {
      email: { type: "string", format: "email" },
      username: { type: "string", nullable: true },
      fullname: { type: "string" },
      password: { type: "string", nullable: true },
      provider: {
        type: "string",
        nullable: true,
        enum: ["google", "sandbox", null],
      },
      signInMethod: { type: "string" },
      purpose: { type: "string" },
    },
  },
};
