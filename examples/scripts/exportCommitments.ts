import { UserFactory } from "../../libs/user";
import { config } from "./appConfig";

const main = async () => {
  let user;
  try {
    // # 1 Create an instance of User
    user = await UserFactory.create({
      blockchainWsUrl: config.blockchainWsUrl,
      clientApiUrl: config.clientApiUrl,
      ethereumPrivateKey: config.ethereumPrivateKey,
      nightfallMnemonic: config.nightfallMnemonic,
    });

    // # 2 Export commitments in JSON format to `pathToExport`
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
    console.log("Bye bye");
  }
};

main();
