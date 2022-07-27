import {
  UserFactory,
  BLOCKCHAIN_WS_URL_DEFAULT,
  CLIENT_API_URL_DEFAULT,
} from "../libs/user";
import * as dotenv from "dotenv";
import path from "path";

const rootPath = path.resolve();
dotenv.config({ path: path.join(rootPath, ".env") });

const ETHEREUM_PRIVATE_KEY =
  "0x4775af73d6dc84a0ae76f8726bda4b9ecf187c377229cb39e1afa7a18236a69e";
const NIGHTFALL_MNEMONIC = process.env.SDK_NIGHTFALL_MNEMONIC;
const TOKEN_ADDRESS = "0x4f3c4F8D4575Cf73c2FAf9F36cc505e19E65B9C0";
const TOKEN_STANDARD = "ERC20";
const VALUE_TO_BE_TRANSFERED = "0.0001";

const options = {
  blockchainWsUrl: BLOCKCHAIN_WS_URL_DEFAULT,
  clientApiUrl: CLIENT_API_URL_DEFAULT,
  ethereumPrivateKey: ETHEREUM_PRIVATE_KEY,
  nightfallMnemonic: NIGHTFALL_MNEMONIC,
};

const main = async () => {
  let userSender;
  let userRecipient;
  try {
    userSender = await UserFactory.create(options);
    userRecipient = await UserFactory.create({
      blockchainWsUrl: options.blockchainWsUrl,
      clientApiUrl: options.clientApiUrl,
      ethereumPrivateKey: options.ethereumPrivateKey,
    });
    const status = await userSender.checkStatus();
    console.log(status);

    const transfer = await userSender.makeTransfer({
      tokenAddress: TOKEN_ADDRESS,
      tokenStandard: TOKEN_STANDARD,
      value: VALUE_TO_BE_TRANSFERED,
      recipientAddress: userRecipient.zkpKeys.compressedZkpPublicKey,
    });
    console.log("transfer object: ", transfer);
    console.log("Nightfall tx hashes ::", userSender.nightfallTxHashes);
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    userSender.close();
    //userRecipient.close();
    console.log("Closing tranfer operation!");
  }
};

main();
