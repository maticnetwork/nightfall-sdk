import { UserFactory } from "../../libs/user";
import { config } from "./appConfig";
import { randomL2TokenAddress, randomSalt } from "../../libs/utils/random";

const main = async () => {
  let user;

  try {
    // # 1 Create an instance of User
    user = await UserFactory.create({
      clientApiUrl: config.clientApiUrl,
      nightfallMnemonic: config.nightfallMnemonic,
      ethereumPrivateKey: config.ethereumPrivateKey,
      blockchainWsUrl: config.blockchainWsUrl,
    });

    // # 2 Mint token within L2
    const tokenAddress = await randomL2TokenAddress();
    const salt = await randomSalt();
    const txReceipts = await user.mintL2Token({
      tokenAddress,
      value: config.value,
      tokenId: config.tokenId,
      salt, // optional
      feeWei: "0",
    });
    console.log("Transaction receipts", txReceipts);

    // # 3 [OPTIONAL] You can check the transaction hash
    console.log("Nightfall minting tx hashes", user.nightfallMintingTxHashes);
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    user.close();
    console.log("Bye bye");
  }
};

main();
