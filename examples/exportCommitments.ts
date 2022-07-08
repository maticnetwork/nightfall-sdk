import * as dotenv from "dotenv";
import path from "path";
import { User } from "../libs/user";

const _rootPath = path.resolve();
dotenv.config({ path: path.join(_rootPath, ".env") });

// Script config for goerli
const environment = {
  blockchainNetwork: process.env.SDK_ENV_BLOCKCHAIN_NETWORK,
  blockchainWsUrl: process.env.SDK_ENV_BLOCKCHAIN_WEBSOCKET_URL,
  clientApiUrl: process.env.SDK_ENV_CLIENT_API_URL,
};

/**
 * @function main a script to test the export commitments flow
 * @author luizoamorim
 */
const main = async () => {
  try {
    const user = new User(environment);
    await user.init({
      ethereumPrivateKey: process.env.SDK_ETH_PRIVATE_KEY,
      nightfallMnemonic: process.env.SDK_NIGHTFALL_MNEMONIC,
    });
    await user.exportCommitments(user.zkpKeys.compressedPkd);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

main();
