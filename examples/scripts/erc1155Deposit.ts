import { UserFactory } from "../../libs/user";
import { config } from "./appConfig";
import Web3 from "web3";
import type { AbiItem } from "web3-utils";
import erc1155Abi from "../../libs/tokens/abis/ERC1155.json";

const web3 = new Web3(config.blockchainWsUrl);
const erc1155AbiItem = erc1155Abi as unknown as AbiItem;

// Example script
const main = async () => {
  let user;
  try {
    // # 1 Create an instance of User (mnemonic is optional)
    user = await UserFactory.create({
      blockchainWsUrl: config.blockchainWsUrl,
      clientApiUrl: config.clientApiUrl,
      ethereumPrivateKey: config.ethereumPrivateKey,
      nightfallMnemonic: config.nightfallMnemonic,
    });

    const contract = new web3.eth.Contract(
      erc1155AbiItem,
      config.tokenContractAddress,
    );

    // # 2 [OPTIONAL] Check the Layer 1 balance of the token you want to deposit
    const balance = await contract.methods.balanceOf(user.ethAddress, 4).call();

    // # 3 Make ERC1155 deposit
    const tokenContractAddress = config.tokenContractAddress;
    const tokenErcStandard = "ERC1155";

    // Making an ERC1155 deposit requires both the tokenId and the value of the correponsding token to be deposited
    const txReceipts = await user.makeDeposit({
      tokenContractAddress,
      tokenErcStandard,
      tokenId: "4",
      value: "2000",
    });

    console.log("Transaction receipts", txReceipts);

    // # 4 [OPTIONAL] You can check the transaction hash
    console.log("Nightfall deposit tx hashes", user.nightfallDepositTxHashes);

    // # 5 [OPTIONAL] You can check deposits that are not yet in Nightfall
    const pendingDeposits = await user.checkPendingDeposits();
    console.log("Pending balances", pendingDeposits);
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    user.close();
    console.log("Bye bye");
  }
};

main();
