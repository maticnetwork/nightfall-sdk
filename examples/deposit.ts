import {
  BLOCKCHAIN_WEBSOCKET_URL_DEFAULT,
  CLIENT_API_URL_DEFAULT,
  ETH_PRIVATE_KEY_DEFAULT,
  TOKEN_ADDRESS_DEFAULT,
} from "./constants";
import { UserFactory } from "../libs/user";
import * as dotenv from "dotenv";
import path from "path";

const rootPath = path.resolve();
dotenv.config({ path: path.join(rootPath, "examples/.env") });

/*
  SCRIPT ARRANGEMENTS
  -------------------
  * Pass `dev` to UserFactory.create when connecting to ganache
  * Pass `test` when connecting to testnet
  * Remember `nightfallMnemonic` is optional
*/

const dev = {
  clientApiUrl: CLIENT_API_URL_DEFAULT,
  blockchainWsUrl: BLOCKCHAIN_WEBSOCKET_URL_DEFAULT, // ganache
  ethereumPrivateKey: ETH_PRIVATE_KEY_DEFAULT,
};

const test = {
  clientApiUrl: process.env.SDK_CLIENT_API_URL,
  blockchainWsUrl: process.env.SDK_BLOCKCHAIN_WEBSOCKET_URL, // goerli
  ethereumPrivateKey: process.env.SDK_ETH_PRIVATE_KEY,
  nightfallMnemonic: process.env.SDK_NIGHTFALL_MNEMONIC,
};

const tokenAddress = TOKEN_ADDRESS_DEFAULT; // for goerli rely on process.env.TOKEN_ADDRESS

/*
  ACTUAL SCRIPT
*/

const main = async () => {
  let user;
  try {
    user = await UserFactory.create(dev);
    const status = await user.checkStatus();
    console.log(status);

    const tokenStandard = "ERC20";
    const value = "0.0001";
    const deposit = await user.makeDeposit({
      tokenAddress,
      tokenStandard,
      value,
    });
    console.log(deposit);
    console.log("Nightfall tx hashes ::", user.nightfallTxHashes);

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
