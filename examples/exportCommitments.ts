import * as dotenv from "dotenv";
import path from "path";
import { User } from "../libs/user";

const _rootPath = path.resolve();
dotenv.config({ path: path.join(_rootPath, ".env") });

// Script config for goerli
const environment = {
  blockchainNetwork: process.env.SDK_ENV_BLOCKCHAIN_NETWORK,
  blockchainWsUrl: process.env.SDK_ENV_BLOCKCHAIN_WEBSOCKET_URL,
  clientApiUrl: process.env.SDK_ENV_API_URL,
};

// Script
const main = async () => {
  try {
    const user = new User(environment);    
    user.exportCommitments('./')    
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

main();
