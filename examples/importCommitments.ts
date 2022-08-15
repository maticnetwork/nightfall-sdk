import { UserFactory } from "../libs/user";
import { config } from "./appConfig";

/**
 * @function main a script to test the import commitments flow
 * @author luizoamorim
 */
const main = async () => {
  let user;
  try {
    user = await UserFactory.create({
      blockchainWsUrl: config.blockchainWsUrl,
      clientApiUrl: config.clientApiUrl,
      ethereumPrivateKey: config.ethereumPrivateKey,
    });

    await user.importAndSaveCommitments(
      "./",
      "commitmentsBackup.json",
      user.zkpKeys.compressedZkpPublicKey,
    );
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    user.close();
  }
};

main();
