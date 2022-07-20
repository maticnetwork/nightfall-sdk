import * as dotenv from "dotenv";
import path from "path";
import { UserFactory } from "../libs/user";

const _rootPath = path.resolve();
dotenv.config({ path: path.join(_rootPath, ".env") });

const options = {
  blockchainWsUrl: process.env.SDK_BLOCKCHAIN_WEBSOCKET_URL,
  clientApiUrl: process.env.SDK_CLIENT_API_URL,
  ethereumPrivateKey: process.env.SDK_ETH_PRIVATE_KEY,
  nightfallMnemonic: process.env.SDK_NIGHTFALL_MNEMONIC,
};

/**
 * @function main a script to test the export commitments flow
 * @author luizoamorim
 */
const main = async () => {
  let user;
  try {
    user = await UserFactory.create(options);

    await user.exportCommitments({
      listOfCompressedZkpPublicKey: [user.zkpKeys.compressedZkpPublicKey],
      pathToExport: "./",
      fileName: "commitmentsBackup.json",
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    user.close();
  }
};

main();
