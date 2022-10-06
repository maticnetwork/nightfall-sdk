import { UserFactory } from "../../libs/user";
import { config } from "./appConfig";
import type { AbiItem } from "web3-utils";
import erc165Abi from "../../libs/tokens/abis/ERC165.json";
import { ERC20, ERC721, ERC1155 } from "../../libs/tokens/constants";

const erc165AbiItem = erc165Abi as unknown as AbiItem;

const main = async () => {
  let user;
  let tokenType;
  let tokenId;
  let value;
  let web3;
  const tokenContractAddress = config.tokenContractAddress;

  try {
    // # 1 Create an instance of User
    user = await UserFactory.create({
      blockchainWsUrl: config.blockchainWsUrl,
      clientApiUrl: config.clientApiUrl,
      ethereumPrivateKey: config.ethereumPrivateKey,
      nightfallMnemonic: config.nightfallMnemonic,
    });
    web3 = user.web3Websocket.web3;

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

        // TokenId to be withdrawn
        tokenId =
          "28948022309329048855892746252171976963317496166410141009864396001978282410025";
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
      value = "0.000001";
      tokenId = "0x00";
    }

    const tokenErcStandard = tokenType;
    // # 2 Make withdrawal
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
