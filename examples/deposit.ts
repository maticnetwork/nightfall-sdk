import { User } from "../libs/user";
import * as dotenv from "dotenv";
import path from "path";

const _rootPath = path.resolve();
dotenv.config({ path: path.join(_rootPath, ".env") });

// Script config for ganache
// const ethereumPrivateKey =
//   "0x4775af73d6dc84a0ae76f8726bda4b9ecf187c377229cb39e1afa7a18236a69e";
// const tokenAddress = "0xf05e9FB485502E5A93990C714560b7cE654173c3"; // ERC20Mock contract address in ganache

// Script config for goerli
const environment = {
  blockchainNetwork: process.env.SDK_ENV_BLOCKCHAIN_NETWORK,
  blockchainWs: process.env.SDK_ENV_BLOCKCHAIN_WEBSOCKET,
  apiUrl: process.env.SDK_ENV_API_URL,
};
const ethereumPrivateKey = process.env.SDK_ETH_PRIVATE_KEY;
const tokenAddress = process.env.SDK_ETH_TOKEN_ADDRESS; // MATIC contract address in goerli

// Script
const main = async () => {
  try {
    const user = new User(environment); // now goerli
    const status = await user.checkStatus();
    console.log(status);

    const configUser = await user.init({
      ethereumPrivateKey: ethereumPrivateKey,
    });
    console.log(configUser);

    const tokenStandard = "ERC20";
    const value = "0.0014";
    const deposit = await user.makeDeposit({
      tokenAddress,
      tokenStandard,
      value,
    }); // wei 20000000000000000

    user.close();
    console.log("Bye bye");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

main();
