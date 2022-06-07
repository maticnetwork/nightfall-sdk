import { Env } from "../types/types";

const environments: { [key: string]: Env } = {
  development: {
    blockchainNetwork: process.env.BLOCKCHAIN_NETWORK || "ganache",
    blockchainWs: process.env.BLOCKCHAIN_WEBSOCKET || "ws://localhost:8546",
    apiUrl: process.env.API_URL || "http://localhost:8080",
  },
};

export default environments;
