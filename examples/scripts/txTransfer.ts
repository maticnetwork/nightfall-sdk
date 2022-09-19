import { UserFactory } from "../../libs/user";
import { config } from "./appConfig";

const main = async () => {
  let userSender;
  let userRecipient;
  try {
    // # 1 Create an instance of User
    userSender = await UserFactory.create({
      blockchainWsUrl: config.blockchainWsUrl,
      clientApiUrl: config.clientApiUrl,
      ethereumPrivateKey: config.ethereumPrivateKey,
      nightfallMnemonic: config.nightfallMnemonic,
    });

    // # 2 [OPTIONAL] For this example, we create a 2nd instance
    userRecipient = await UserFactory.create({
      blockchainWsUrl: config.blockchainWsUrl,
      clientApiUrl: config.clientApiUrl,
      ethereumPrivateKey: config.ethereumPrivateKey,
    });

    // # 3 Make transfer
    const tokenContractAddress = config.tokenContractAddress;
    const tokenErcStandard = "ERC20";
    const value = "0.0001";
    const tokenId = "0x00";
    const txReceipts = await userSender.makeTransfer({
      tokenContractAddress,
      tokenErcStandard,
      value,
      tokenId,
      recipientNightfallAddress: userRecipient.getNightfallAddress(),
      // isOffChain: true,
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
    userRecipient.close();
    console.log("Bye bye");
  }
};

main();
