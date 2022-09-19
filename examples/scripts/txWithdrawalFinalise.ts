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
      "0xbf393d88c0753666b0431d874c977ea3c625874d3307782c239e7d1964c75dd0";
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
