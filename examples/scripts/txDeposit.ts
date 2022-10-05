import { UserFactory } from "../../libs/user";
import { config } from "./appConfig";
import Web3 from "web3";
import type { AbiItem } from "web3-utils";
import erc721Abi from "../../libs/tokens/abis/ERC721.json";
import erc165Abi from "../../libs/tokens/abis/ERC165.json";
import { ERC20, ERC721, ERC1155 } from "../../libs/tokens/constants";

const web3 = new Web3(config.blockchainWsUrl);
const erc721AbiItem = erc721Abi as unknown as AbiItem;
const erc165AbiItem = erc165Abi as unknown as AbiItem;

// Example script
const main = async () => {
  let user;
  let tokenType;
  let tokenId;
  let value;
  const tokenContractAddress = config.tokenContractAddress;

  try {
    // # 1 Create an instance of User (mnemonic is optional)
    // Not providing an existing mnemonic creates a new Nightfall user
    user = await UserFactory.create({
      blockchainWsUrl: config.blockchainWsUrl,
      clientApiUrl: config.clientApiUrl,
      ethereumPrivateKey: config.ethereumPrivateKey,
      nightfallMnemonic: config.nightfallMnemonic,
    });

    // # 2 [OPTIONAL] If you did not pass a mnemonic, you can retrieve it
    const mnemonic = user.getNightfallMnemonic();

    // # 3 [OPTIONAL] You can check API Client, blockchain ws connection
    const status = await user.checkStatus();
    console.log("API Client, blockchain ws statuses", status);

    // Get the ERC Token standard from the contract address
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
        // Making an ERC721 deposit requires both only tokenId and no value
        value = "0";
        const contract = new web3.eth.Contract(
          erc721AbiItem,
          tokenContractAddress,
        );
        // Number of tokens owned by the address
        const balance = await contract.methods
          .balanceOf(user.ethAddress)
          .call();

        // Create an NFT to be deposited to Nightfall
        const tx = await contract.methods.awardItem(user.ethAddress, "test");
        const gas = await tx.estimateGas({
          from: user.ethAddress,
        });
        const gasPrice = await web3.eth.getGasPrice();
        const data = tx.encodeABI();
        const nonce = await web3.eth.getTransactionCount(user.ethAddress);
        const signedTx = await web3.eth.accounts.signTransaction(
          {
            to: tokenContractAddress,
            data,
            gas,
            gasPrice,
            nonce,
          },
          config.ethereumPrivateKey,
        );
        const receipt = await web3.eth.sendSignedTransaction(
          signedTx.rawTransaction,
          function (error, hash) {
            if (!error) {
              console.log(hash);
            } else {
              console.log(error);
            }
          },
        );
        // Get the tokenId from the created NFT
        tokenId = await contract
          .getPastEvents("Transfer", {
            filter: {
              _from: user.ethAddress,
            },
            fromBlock: 0,
          })
          .then((events) => {
            const tokenIdToReturn =
              events[events.length - 1].returnValues.tokenId;
            console.log("The ID of the token to be deposited", tokenIdToReturn);

            return events[events.length - 1].returnValues.tokenId;
          });
      } else {
        const interface1155 = await ercContract.methods
          .supportsInterface("0xd9b67a26")
          .call(); // ERC1155 interface

        if (interface1155) {
          tokenType = ERC1155;
          // Making an ERC1155 deposit requires both the tokenId and the value of the correponsding token to be deposited
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

    // # 4 Make deposit
    const tokenErcStandard = tokenType;
    const txReceipts = await user.makeDeposit({
      tokenContractAddress,
      tokenErcStandard,
      value,
      tokenId,
    });

    console.log("Transaction receipts", txReceipts);

    // # 5 [OPTIONAL] You can check the transaction hash
    console.log("Nightfall deposit tx hashes", user.nightfallDepositTxHashes);

    // # 6 [OPTIONAL] You can check deposits that are not yet in Nightfall
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
