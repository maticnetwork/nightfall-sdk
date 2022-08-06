import { UserFactory } from "../libs/user";
import * as dotenv from "dotenv";
import path from "path";

// App config
const config = {
  blockchainWsUrl: process.env.APP_BLOCKCHAIN_WEBSOCKET_URL,
  clientApiUrl: process.env.APP_CLIENT_API_URL,
  ethereumPrivateKey: process.env.APP_ETH_PRIVATE_KEY,
  nightfallMnemonic: process.env.APP_NIGHTFALL_MNEMONIC,
  tokenAddress: process.env.APP_TOKEN_ADDRESS_1,
};

// Example script
const main = async () => {
  let user;
  try {
    user = await UserFactory.create({
      blockchainWsUrl: config.blockchainWsUrl,
      clientApiUrl: config.clientApiUrl,
      ethereumPrivateKey: config.ethereumPrivateKey,
      nightfallMnemonic: config.nightfallMnemonic,
    });

    const status = await user.checkStatus();
    console.log(status);

    const tokenAddress = config.tokenAddress;
    const tokenStandard = "ERC20";
    const value = "0.0001";
    const receipts = await user.makeDeposit({
      tokenAddress,
      tokenStandard,
      value,
    });
    console.log(receipts);
    console.log(
      "Nightfall deposit tx hashes ::",
      user.nightfallDepositTxHashes,
    );

    const balances = await user.checkPendingDeposits();
    console.log(balances);
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    user.close();
    console.log("Bye bye");
  }
};

main();
