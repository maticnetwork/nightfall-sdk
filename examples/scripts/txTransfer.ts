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

    // # 3 [OPTIONAL] If you did not pass a mnemonic, you can retrieve it
    const mnemonic = userSender.getNightfallMnemonic();

    // # 4 [OPTIONAL] You can check API Client, blockchain ws connection
    const isClientAlive = await userSender.isClientAlive();
    const isWeb3WsAlive = await userSender.isWeb3WsAlive();
    console.log(
      `API Client alive: ${isClientAlive}, blockchain ws alive: ${isWeb3WsAlive}`,
    );

    // # 5 Make transfer
    const txReceipts = await userSender.makeTransfer({
      tokenContractAddress: config.tokenContractAddress,
      value: config.value,
      // tokenId: config.tokenId,
      recipientNightfallAddress: userRecipient.getNightfallAddress(),
      // isOffChain: true,
    });
    console.log("Transaction receipts", txReceipts);

    // # 6 [OPTIONAL] You can check the transaction hash
    console.log(
      "Nightfall deposit tx hashes",
      userSender.nightfallTransferTxHashes,
    );

    // # 7 [OPTIONAL] You can check transfers that are not yet in a block
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
