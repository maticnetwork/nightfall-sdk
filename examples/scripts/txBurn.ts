import { UserFactory } from "../../libs/user";
import { config } from "./appConfig";
import { Client } from '../../libs/client'
import { NightfallSdkError } from "../../libs/utils/error";


const main = async () => {
  let user;
  let value:number;
  let tokenId:string;
  const feeWei = "0";
  const client = new Client(config.clientApiUrl);
  let unspentCommitments:any;
  try {
    // # 1 Create an instance of User
    user = await UserFactory.create({
      blockchainWsUrl: config.blockchainWsUrl,
      clientApiUrl: config.clientApiUrl,
      ethereumPrivateKey: config.ethereumPrivateKey,
      nightfallMnemonic: config.nightfallMnemonic,
    });

    // example address. I can get one from ../../libs/utils/random:randomL2TokenAddress
    const tokenAddress = "0x300000000000000000000000d7b31f55b06a8fe34282aa62f250961d7afebc0a";
    const myNightfallAddress =  user.getNightfallAddress();

    unspentCommitments = await client.getUnspentCommitments([myNightfallAddress],[tokenAddress]);
    if ( !(myNightfallAddress in unspentCommitments) ||  !(tokenAddress in unspentCommitments[myNightfallAddress])){
      console.log("No suitable commitments found")
      throw new NightfallSdkError("No suitable commitments were found");
    }

    // pick one commitment to burn. For now, at most 1 commitment can be burnt
    value = unspentCommitments[myNightfallAddress][tokenAddress][0].balance;
    tokenId = unspentCommitments[myNightfallAddress][tokenAddress][0].tokenId;

    console.log("VALUE", value)
    // # 2 Burn
    const txReceipts = await user.makeBurn({
      tokenAddress,
      tokenId, 
      value, 
      feeWei, 
    });
    console.log("Transaction receipts", txReceipts);

    // # 3 [OPTIONAL] You can check the transaction hash
    console.log(
      "Nightfall burn tx hashes",
      user.nightfallBurnTxHashes,
    );

  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    user.close();
    console.log("Bye bye");
  }
};

main();
