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

    // # 2 [OPTIONAL] If you did not pass a mnemonic, you can retrieve it
    const mnemonic = user.getNightfallMnemonic();

    // # 3 [OPTIONAL] You can check API Client, blockchain ws connection
    const isClientAlive = await user.isClientAlive();
    const isWeb3WsAlive = await user.isWeb3WsAlive();
    console.log(
      `API Client alive: ${isClientAlive}, blockchain ws alive: ${isWeb3WsAlive}`,
    );

    // # 4 Make withdrawal
    const recipientEthAddress = "0x9C8B2276D490141Ae1440Da660E470E7C0349C63";
    const txReceipts = await user.makeWithdrawal({
      tokenContractAddress: config.tokenContractAddress,
      value: config.value,
      // tokenId: config.tokenId,
      recipientEthAddress,
      // isOffChain: true,
    });
    console.log("Transaction receipts", txReceipts);

    // # 5 Retrieve the transaction hash to finalise the withdrawal after the cooling off period
    console.log(
      "Nightfall withdrawal tx hashes",
      user.nightfallWithdrawalTxHashes,
    );
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    user.close();
    console.log("Bye bye");
  }
};

main();
