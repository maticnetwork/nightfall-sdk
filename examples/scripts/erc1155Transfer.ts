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
      ethereumPrivateKey: config.ethereumPrivateKey, // ethereum private key
    });

    // # 3 Make transfer
    const tokenContractAddress = config.tokenContractAddress;
    const tokenErcStandard = "ERC1155";

    // Making an ERC1155 transfer requires both the tokenId and the value of the correponsding token to be transferred
    const txReceipts = await userSender.makeTransfer({
      tokenContractAddress,
      tokenErcStandard,
      tokenId: "1",
      value: "200",
      recipientNightfallAddress: userRecipient.getNightfallAddress(),
      // 'feeWei',
      // isOffChain: true,
    });
    console.log("Transaction receipts", txReceipts);

    // # 4 [OPTIONAL] You can check the transaction hash
    console.log(
      "Nightfall deposit tx hashes",
      userSender.nightfallTransferTxHashes,
    );

    const reciepientPendingTransfers = userRecipient.checkPendingTransfers();
    const recipientBalance = userRecipient.checkNightfallBalances();

    console.log("User recipient pendingTransfers", reciepientPendingTransfers);
    console.log("User recipient balances", recipientBalance);

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
