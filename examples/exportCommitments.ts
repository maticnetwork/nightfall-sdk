import * as dotenv from "dotenv";
import path from "path";
import {
  UserFactory,
  BLOCKCHAIN_WS_URL_DEFAULT,
  CLIENT_API_URL_DEFAULT,
} from "../libs/user";

const _rootPath = path.resolve();
dotenv.config({ path: path.join(_rootPath, ".env") });

const ETHEREUM_PRIVATE_KEY =
  "0x4775af73d6dc84a0ae76f8726bda4b9ecf187c377229cb39e1afa7a18236a69e";
const NIGHTFALL_MNEMONIC = process.env.SDK_NIGHTFALL_MNEMONIC;

const options = {
  blockchainWsUrl: BLOCKCHAIN_WS_URL_DEFAULT,
  clientApiUrl: CLIENT_API_URL_DEFAULT,
  ethereumPrivateKey: ETHEREUM_PRIVATE_KEY,
  nightfallMnemonic: NIGHTFALL_MNEMONIC,
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
