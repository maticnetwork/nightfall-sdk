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

    // # 2 Pass withdrawal transaction hash to finalise the withdrawal
    const withdrawTxHashL2 =
      "0x63f301110c0e2d1480e761d369f6406dcaf226370480011e6d5e1eaae4a8243e";
    const txReceipt = await user.finaliseWithdrawal({ withdrawTxHashL2 });
    console.log("Transaction receipt", txReceipt);
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    user.close();
    console.log("Bye bye");
  }
};

main();
