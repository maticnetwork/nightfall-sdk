import {
  UserFactory,
  BLOCKCHAIN_WS_URL_DEFAULT,
  CLIENT_API_URL_DEFAULT,
} from "../libs/user";
import * as dotenv from "dotenv";
import path from "path";

const rootPath = path.resolve();
dotenv.config({ path: path.join(rootPath, ".env") });

// Script config for goerli
const BLOCKCHAIN_WEBSOCKET_URL = process.env.SDK_BLOCKCHAIN_WEBSOCKET_URL;
const CLIENT_API_URL = process.env.SDK_CLIENT_API_URL;
const ETHEREUM_PRIVATE_KEY = process.env.SDK_ETH_PRIVATE_KEY;
const NIGHTFALL_MNEMONIC = process.env.SDK_NIGHTFALL_MNEMONIC;

const options = {
  blockchainWsUrl: BLOCKCHAIN_WEBSOCKET_URL || BLOCKCHAIN_WS_URL_DEFAULT,
  clientApiUrl: CLIENT_API_URL || CLIENT_API_URL_DEFAULT,
  ethereumPrivateKey: ETHEREUM_PRIVATE_KEY,
  nightfallMnemonic: NIGHTFALL_MNEMONIC,
};

// Script
const main = async () => {
  try {
    const user = await UserFactory.create(options);
    const status = await user.checkStatus();
    console.log(status);

    const balances = await user.checkNightfallBalances();
    console.log(balances);

    user.close();
    console.log("Bye bye");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

main();
