import {
  LOCAL_SERVER_ORIGIN,
  PRODUCTION_SERVER_ORIGIN,
  SERVER_ORIGIN,
  isProdMode,
} from "../config/constants";
import { getClientUrl } from "../utils";

const isProductionUrl = (url = "") =>
  !/localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]/i.test(url);

const buildServerEntry = (url, description) => ({ url, description });

export const buildServers = (requestOrigin = "") => {
  const resolvedOrigin = requestOrigin
    ? getClientUrl(requestOrigin)
    : isProdMode
    ? SERVER_ORIGIN
    : LOCAL_SERVER_ORIGIN;

  const production = buildServerEntry(
    PRODUCTION_SERVER_ORIGIN,
    "Production - live Render deployment"
  );

  const local = buildServerEntry(
    LOCAL_SERVER_ORIGIN,
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
