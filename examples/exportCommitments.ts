import * as dotenv from "dotenv";
import path from "path";
import { User } from "../libs/user";

const _rootPath = path.resolve();
dotenv.config({ path: path.join(_rootPath, ".env") });

// Script config for goerli
const environment = {
  blockchainNetwork: "test",
  blockchainWsUrl: process.env.SDK_ENV_BLOCKCHAIN_WEBSOCKET_URL,
  clientApiUrl: process.env.SDK_ENV_CLIENT_API_URL,
};

/**
 * @function main a script to test the export commitments flow
 * @author luizoamorim
 */
const main = async () => {
  let user;
  try {
    user = new User(environment);
    await user.init({
      ethereumPrivateKey: process.env.SDK_ETH_PRIVATE_KEY,
      nightfallMnemonic: process.env.SDK_NIGHTFALL_MNEMONIC,
    });

    await user.exportCommitments(
      [user.zkpKeys.compressedZkpPublicKey],
      "./",
      "commitmentsBackup.json",
    );
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    user.close();
  }
};

main();
