import { UserFactory } from "../libs/user";
import { config } from "./appConfig";

// Example script
const main = async () => {
  let user;
  try {
    // # 1 Create an instance of User (mnemonic is optional)
    user = await UserFactory.create({
      blockchainWsUrl: config.blockchainWsUrl,
      clientApiUrl: config.clientApiUrl,
      ethereumPrivateKey: config.ethereumPrivateKey,
      nightfallMnemonic: config.nightfallMnemonic,
    });

    // # 2 [OPTIONAL] If you did not pass a mnemonic, you can retrieve it
    // COMING SOON

    // # 3 [OPTIONAL] You can check API Client, blockchain ws connection
    const status = await user.checkStatus();
    console.log(status);

    // # 4 Make deposit
    const tokenAddress = config.tokenAddress;
    const tokenStandard = "ERC20";
    const value = "0.0001";
    const txReceipts = await user.makeDeposit({
      tokenAddress,
      tokenStandard,
      value,
    });
    console.log("Transaction receipts", txReceipts);

    // # 5 [OPTIONAL] You can check the transaction hash
    console.log("Nightfall deposit tx hashes", user.nightfallDepositTxHashes);

    // # 6 [OPTIONAL] You can check deposits that are not yet in Nightfall
    const pendingDeposits = await user.checkPendingDeposits();
    console.log("Pending balances", pendingDeposits);
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    user.close();
    console.log("Bye bye");
  }
};

main();
