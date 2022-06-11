import { Env } from "./types";

const ENV_BC_NETWORK_DEFAULT = "ganache";
const ENV_BC_WEBSOCKET_DEFAULT = "ws://localhost:8546";
const ENV_API_URL_DEFAULT = "http://localhost:8080";

export const NIGHTFALL_DEFAULT_CONFIG: Env = {
  blockchainNetwork: ENV_BC_NETWORK_DEFAULT,
  blockchainWs: ENV_BC_WEBSOCKET_DEFAULT,
  apiUrl: ENV_API_URL_DEFAULT,
};

export const CONTRACT_SHIELD = "Shield";

export const TX_FEE_DEFAULT = 10;
