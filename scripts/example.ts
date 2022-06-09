// npx ts-node scripts/example.ts

import User from "../src/entities/user";
import * as dotenv from "dotenv";
import path from "path";

const _rootPath = path.resolve();
dotenv.config({ path: path.join(_rootPath, ".env") });

// Script config for ganache
// const ethereumPrivateKey =
//   "0x4775af73d6dc84a0ae76f8726bda4b9ecf187c377229cb39e1afa7a18236a69e";

// Script config for goerli
const environment = {
  blockchainNetwork: process.env.SDK_ENV_BLOCKCHAIN_NETWORK,
  blockchainWs: process.env.SDK_ENV_BLOCKCHAIN_WEBSOCKET,
  apiUrl: process.env.SDK_ENV_API_URL,
};
const ethereumPrivateKey =
  "0xdfa0f64681e33a5682900779c1155b1b1eed82fdd12302a70cfbaa2926734361"; // Prepend `0x`

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
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

main();
