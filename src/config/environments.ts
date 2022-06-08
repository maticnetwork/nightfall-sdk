import { Env } from "../types/types";

const environments: { [key: string]: Env } = {
  development: {
    blockchainNetwork: "ganache",
    blockchainWs: "ws://localhost:8546",
    apiUrl: "http://localhost:8080",
  },
  testing: {
    blockchainNetwork: process.env.BLOCKCHAIN_NETWORK,
    blockchainWs: process.env.BLOCKCHAIN_WEBSOCKET,
    apiUrl: process.env.API_URL,
  },
};

export default environments;
