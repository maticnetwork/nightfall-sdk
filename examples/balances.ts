import {
  UserFactory,
  BLOCKCHAIN_WS_URL_DEFAULT,
  CLIENT_API_URL_DEFAULT,
} from "../libs/user";
import * as dotenv from "dotenv";
import path from "path";

const rootPath = path.resolve();
dotenv.config({ path: path.join(rootPath, ".env") });

// Script config for ganache
const ETHEREUM_PRIVATE_KEY_DEFAULT =
  "0x4775af73d6dc84a0ae76f8726bda4b9ecf187c377229cb39e1afa7a18236a69e";

const options = {
  blockchainWsUrl: BLOCKCHAIN_WS_URL_DEFAULT,
  clientApiUrl: CLIENT_API_URL_DEFAULT,
  ethereumPrivateKey: ETHEREUM_PRIVATE_KEY_DEFAULT,
  nightfallMnemonic: "", // Add mnemonic for retrieving balances
};

// Script
const main = async () => {
  let user;
  try {
    user = await UserFactory.create(options);
    const status = await user.checkStatus();
    console.log(status);

    const balances = await user.checkNightfallBalances();
    console.log("BALANCES: ", balances);
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    user.close();
    console.log("Bye bye");
  }
};

main();
