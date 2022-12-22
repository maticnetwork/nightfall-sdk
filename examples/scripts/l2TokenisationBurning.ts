import { UserFactory } from "../../libs/user";
import { config } from "./appConfig";
import { Client } from "../../libs/client";

const main = async () => {
  let user;
  const client = new Client(config.clientApiUrl);

  try {
    // # 1 Create an instance of User
    user = await UserFactory.create({
      blockchainWsUrl: config.blockchainWsUrl,
      clientApiUrl: config.clientApiUrl,
      ethereumPrivateKey: config.ethereumPrivateKey,
      nightfallMnemonic: config.nightfallMnemonic,
    });

    const myNightfallAddress = user.getNightfallAddress();
    const unspentCommitments = await client.getUnspentCommitments([
      myNightfallAddress,
    ]);

    // #2 Pick one commitment to burn
    // For now, at most 1 commitment can be burnt
    const commitmentsToBurn = Object.values(
      unspentCommitments[myNightfallAddress as keyof object],
    )[0];

    console.log("commitmentToBurn", commitmentsToBurn);
    // # 3 Burn
    const txReceipts = await user.burnL2Token({
      tokenAddress: commitmentsToBurn[0].ercAddress,
      value: String(commitmentsToBurn[0].balance),
      tokenId: commitmentsToBurn[0].tokenId,
      feeWei: "0",
    });
    console.log("Transaction receipts", txReceipts);

    // # 4 [OPTIONAL] You can check the transaction hash
    console.log("Nightfall minting tx hashes", user.nightfallBurningTxHashes);
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    user.close();
    console.log("Bye bye");
  }
};

main();
