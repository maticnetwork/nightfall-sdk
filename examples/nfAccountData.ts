import {
  UserFactory,
  BLOCKCHAIN_WS_URL_DEFAULT,
  CLIENT_API_URL_DEFAULT,
} from "../libs/user";

const ETHEREUM_PRIVATE_KEY =
  "0x4775af73d6dc84a0ae76f8726bda4b9ecf187c377229cb39e1afa7a18236a69e";

const options = {
  blockchainWsUrl: BLOCKCHAIN_WS_URL_DEFAULT,
  clientApiUrl: CLIENT_API_URL_DEFAULT,
  ethereumPrivateKey: ETHEREUM_PRIVATE_KEY,
};

// Script
const main = async () => {
  let user;
  try {
    user = await UserFactory.create(options);

    const mnemonic = user.getNightfallMnemonic();
    console.log(
      "KEEP PRIVATE: Mnemonic for creating Nightfall wallet:",
      mnemonic,
    );

    const address = user.getNightfallAddress();
    console.log("PUBLIC: Address for transacting in Nightfall L2:", address);
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    user.close();
    console.log("Bye bye");
  }
};

main();
