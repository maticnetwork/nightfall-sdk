import {
  UserFactory,
  BLOCKCHAIN_WS_URL_DEFAULT,
  CLIENT_API_URL_DEFAULT,
} from "../libs/user";
import * as dotenv from "dotenv";
import path from "path";

const _rootPath = path.resolve();
dotenv.config({ path: path.join(_rootPath, ".env") });

// Script config for ganache
// const ETHEREUM_PRIVATE_KEY =
//   "0x4775af73d6dc84a0ae76f8726bda4b9ecf187c377229cb39e1afa7a18236a69e";
// const TOKEN_ADDRESS = "0xf05e9FB485502E5A93990C714560b7cE654173c3"; // ERC20Mock contract address in ganache

// Script config for goerli
const BLOCKCHAIN_WEBSOCKET_URL = process.env.SDK_BLOCKCHAIN_WEBSOCKET_URL;
const SDK_CLIENT_API_URL = process.env.SDK_CLIENT_API_URL;
const ETHEREUM_PRIVATE_KEY = process.env.SDK_ETH_PRIVATE_KEY;
const TOKEN_ADDRESS = process.env.SDK_TOKEN_ADDRESS; // MATIC contract address in goerli

const options = {
  blockchainWsUrl: BLOCKCHAIN_WEBSOCKET_URL || BLOCKCHAIN_WS_URL_DEFAULT,
  clientApiUrl: SDK_CLIENT_API_URL || CLIENT_API_URL_DEFAULT,
  ethereumPrivateKey: ETHEREUM_PRIVATE_KEY,
};

// Script
const main = async () => {
  try {
    const user = await UserFactory.create(options);
    const status = await user.checkStatus();
    console.log(status);

    // const tokenStandard = "ERC20";
    // const value = "0.0014";
    // const deposit = await user.makeDeposit({
    //   tokenAddress,
    //   tokenStandard,
    //   value,
    // }); // wei 20000000000000000

    user.close();
    console.log("Bye bye");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

main();
