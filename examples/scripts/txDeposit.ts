import { UserFactory } from "../../libs/user";
import { config } from "./appConfig";

// Example script
const main = async () => {
  let user;

  try {
    // # 1 Create an instance of User (mnemonic is optional)
    // Not providing an existing mnemonic creates a new Nightfall user
    user = await UserFactory.create({
      clientApiUrl: config.clientApiUrl,
      nightfallMnemonic: config.nightfallMnemonic,
      ethereumPrivateKey: config.ethereumPrivateKey,
      blockchainWsUrl: config.blockchainWsUrl,
    });

    // # 2 [OPTIONAL] If you did not pass a mnemonic, you can retrieve it
    const mnemonic = user.getNightfallMnemonic();

    // # 3 [OPTIONAL] You can check API Client, blockchain ws connection
    const isClientAlive = await user.isClientAlive();
    const isWeb3WsAlive = await user.isWeb3WsAlive();
    console.log(
      `API Client alive: ${isClientAlive}, blockchain ws alive: ${isWeb3WsAlive}`,
    );

    // # 4 Make deposit
    const txReceipts = await user.makeDeposit({
      tokenContractAddress: config.tokenContractAddress,
      value: config.value,
      // isFeePaidInL2: true,
      // tokenId: config.tokenId,
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
