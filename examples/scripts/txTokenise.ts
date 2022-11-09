import { UserFactory } from "../../libs/user";
import { config } from "./appConfig";
import { 
  randomSalt
 } from "../../libs/utils/random";


const main = async () => {
  let userSender;
  const value = Number(config.value) || 10;
  const tokenId = config.tokenId || 2345;
  const feeWei = "0";
  try {
    // # 1 Create an instance of User
    userSender = await UserFactory.create({
      blockchainWsUrl: config.blockchainWsUrl,
      clientApiUrl: config.clientApiUrl,
      ethereumPrivateKey: config.ethereumPrivateKey,
      nightfallMnemonic: config.nightfallMnemonic,
    });

    // example address. I can get one from ../../libs/utils/random:randomL2TokenAddress
    const tokenAddress = "0x300000000000000000000000d7b31f55b06a8fe34282aa62f250961d7afebc0a";

    const salt = await randomSalt();
    
    // # 2 Tokenise
    const txReceipts = await userSender.makeTokenise({
      tokenAddress,
      tokenId, 
      value, 
      salt, 
      feeWei, 
    });
    console.log("Transaction receipts", txReceipts);

    // # 3 [OPTIONAL] You can check the transaction hash
    console.log(
      "Nightfall tokenise tx hashes",
      userSender.nightfallTokeniseTxHashes,
    );

  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    userSender.close();
    console.log("Bye bye");
  }
};

main();
