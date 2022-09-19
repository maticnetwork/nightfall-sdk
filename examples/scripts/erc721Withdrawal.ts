import { UserFactory } from "../../libs/user";
import { config } from "./appConfig";

const main = async () => {
  let user;
  try {
    // # 1 Create an instance of User
    user = await UserFactory.create({
      blockchainWsUrl: config.blockchainWsUrl,
      clientApiUrl: config.clientApiUrl,
      ethereumPrivateKey: config.ethereumPrivateKey,
      nightfallMnemonic: config.nightfallMnemonic,
    });

    // # 2 Make withdrawal
    const tokenContractAddress = config.erc721TestAddress;
    const tokenErcStandard = "ERC721";
    const value = "0";
    const tokenId =
      "28948022309329048855892746252171976963317496166410141009864396001978282410026";
    const recipientEthAddress = "0x9C8B2276D490141Ae1440Da660E470E7C0349C63";
    const txReceipts = await user.makeWithdrawal({
      tokenContractAddress,
      tokenErcStandard,
      value,
      tokenId,
      recipientEthAddress,
      // isOffChain: true,
    });
    console.log("Transaction receipts", txReceipts);

    // # 3 Retrieve the transaction hash to finalise the withdrawal after the cooling off period
    console.log(
      "Nightfall withdrawal tx hashes ::",
      user.nightfallWithdrawalTxHashes,
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
