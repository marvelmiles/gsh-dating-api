import { APP_NAME } from "../config/constants";
import { parameters } from "./components/parameters";
import { responses } from "./components/responses";
import { schemas } from "./components/schemas";
import { securitySchemes } from "./components/securitySchemes";
import { gettingStartedDescription } from "./gettingStarted";
import { authPaths } from "./paths/auth";
import { miscPaths } from "./paths/misc";
import { userPaths } from "./paths/users";
import { buildServers } from "./servers";
import { tags } from "./tags";
import { testAccountsDescription } from "./testAccounts";

const withTagDescriptions = () =>
  tags.map((tag) => {
    switch (tag.name) {
      case "Test accounts":
        return { ...tag, description: testAccountsDescription };
      default:
        return tag;
    }
  });

export const buildOpenApiDocument = (requestOrigin = "") => ({
  openapi: "3.0.3",
  info: {
    title: `${APP_NAME} API`,
    version: "1.0.0",
    description: gettingStartedDescription,
    contact: {
      name: "API support",
      email: "soulmatergsh@gmail.com",
    },
    license: { name: "ISC" },
  },
  servers: buildServers(requestOrigin),
  tags: withTagDescriptions(),
  paths: {
    ...authPaths,
    ...userPaths,
    ...miscPaths,
  },
  components: {
    schemas,
    parameters,
    responses,
    securitySchemes,
  },
});

export const swaggerUiOptions = {
  customSiteTitle: `${APP_NAME} API reference`,
  swaggerOptions: {
    docExpansion: "list",
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 3,
    displayRequestDuration: true,
    filter: true,
    persistAuthorization: true,
    tryItOutEnabled: true,
    withCredentials: true,
  },
};
