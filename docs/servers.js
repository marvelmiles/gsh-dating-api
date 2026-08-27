import { SERVER_ORIGIN, isProdMode } from "../config/constants";
import { serverPort } from "../config/env";
import { getClientUrl } from "../utils";

export const PRODUCTION_SERVER_URL = "https://sgh-dating-api.glitch.me";

export const LOCAL_SERVER_URL = `http://localhost:${serverPort}`;

const isProductionUrl = (url = "") =>
  !/localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]/i.test(url);

const buildServerEntry = (url, description) => ({ url, description });

export const buildServers = (requestOrigin = "") => {
  const resolvedOrigin = requestOrigin
    ? getClientUrl(requestOrigin)
    : isProdMode
    ? SERVER_ORIGIN
    : LOCAL_SERVER_URL;

  const production = buildServerEntry(
    PRODUCTION_SERVER_URL,
    "Production - live Glitch deployment"
  );

  const local = buildServerEntry(
    LOCAL_SERVER_URL,
    "Local - development server on this machine"
  );

  const servers = isProductionUrl(resolvedOrigin)
    ? [production, local]
    : [local, production];

  const isKnownServer = servers.some((server) => server.url === resolvedOrigin);

  if (!isKnownServer)
    servers.unshift(
      buildServerEntry(resolvedOrigin, "Current - the host serving this page")
    );

  return servers;
};
