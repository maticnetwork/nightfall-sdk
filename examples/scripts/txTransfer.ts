import { UserFactory } from "../../libs/user";
import { config } from "./appConfig";
import type { AbiItem } from "web3-utils";
import erc165Abi from "../../libs/tokens/abis/ERC165.json";
import { ERC20, ERC721, ERC1155 } from "../../libs/tokens/constants";

const erc165AbiItem = erc165Abi as unknown as AbiItem;

const main = async () => {
  let userSender;
  let userRecipient;
  let tokenType;
  let value;
  let tokenId;
  let web3;
  const tokenContractAddress = config.tokenContractAddress;
  try {
    // # 1 Create an instance of User
    userSender = await UserFactory.create({
      blockchainWsUrl: config.blockchainWsUrl,
      clientApiUrl: config.clientApiUrl,
      ethereumPrivateKey: config.ethereumPrivateKey,
      nightfallMnemonic: config.nightfallMnemonic,
    });
    web3 = userSender.web3Websocket.web3;

    // # 2 [OPTIONAL] For this example, we create a 2nd instance
    userRecipient = await UserFactory.create({
      blockchainWsUrl: config.blockchainWsUrl,
      clientApiUrl: config.clientApiUrl,
      ethereumPrivateKey: config.ethereumPrivateKey,
    });

    try {
      const ercContract = new web3.eth.Contract(
        erc165AbiItem,
        tokenContractAddress,
      );
      const interface721 = await ercContract.methods
        .supportsInterface("0x80ac58cd")
        .call(); // ERC721 interface

      if (interface721) {
        tokenType = ERC721;
        value = "0";

        // TokenId to be transferred
        tokenId =
          "28948022309329048855892746252171976963317496166410141009864396001978282410024";
      } else {
        const interface1155 = await ercContract.methods
          .supportsInterface("0xd9b67a26")
          .call(); // ERC1155 interface

        if (interface1155) {
          tokenType = ERC1155;
          tokenId = "4";
          value = "2000";
        }
      }
    } catch {
      // Expected ERC20
      tokenType = ERC20;
      value = "0.0001";
      tokenId = "0x00";
    }

    // # 3 Make transfer
    const tokenErcStandard = tokenType;
    const txReceipts = await userSender.makeTransfer({
      tokenContractAddress,
      tokenErcStandard,
      value,
      tokenId,
      recipientNightfallAddress: userRecipient.getNightfallAddress(),
      // isOffChain: true,
    });
    console.log("Transaction receipts", txReceipts);

    // # 4 [OPTIONAL] You can check the transaction hash
    console.log(
      "Nightfall deposit tx hashes",
      userSender.nightfallTransferTxHashes,
    );

    // # 5 [OPTIONAL] You can check transfers that are not yet in a block
    const pendingTransfers = await userSender.checkPendingTransfers();
    console.log("Pending balances", pendingTransfers);
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    userSender.close();
    userRecipient.close();
    console.log("Bye bye");
  }
};

main();
