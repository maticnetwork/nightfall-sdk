import { UserFactory } from "../../libs/user";
import { config } from "./appConfig";


const main = async () => {
  let userSender;
  let tokenType;
  let value;
  let tokenId;
  try {
    // # 1 Create an instance of User
    userSender = await UserFactory.create({
      blockchainWsUrl: config.blockchainWsUrl,
      clientApiUrl: config.clientApiUrl,
      ethereumPrivateKey: config.ethereumPrivateKey,
      nightfallMnemonic: config.nightfallMnemonic,
    });

    // # 2 Tokenise
    const tokenErcStandard = tokenType;
    const txReceipts = await userSender.makeTokenise({
      tokenContractAddress,
      tokenErcStandard,
      value,
      tokenId,
      recipientNightfallAddress: userSender.getNightfallAddress(),
    });
    console.log("Transaction receipts", txReceipts);

    // # 4 [OPTIONAL] You can check the transaction hash
    console.log(
      "Nightfall deposit tx hashes",
      userSender.nightfallTransferTxHashes,
    );

    // # 5 [OPTIONAL] You can check transfers that are not yet in a block
    const pendingTransfers = await userSender.checkPendingTransfers();
    console.log("Pending balances", pendingTransfers);
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    userSender.close();
    console.log("Bye bye");
  }
};

main();
