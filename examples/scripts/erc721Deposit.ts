import { UserFactory } from "../../libs/user";
import { config } from "./appConfig";
import Web3 from "web3";
import type { AbiItem } from "web3-utils";
import erc721Abi from "../../libs/tokens/abis/ERC721.json";

const web3 = new Web3(config.blockchainWsUrl);
const erc721AbiItem = erc721Abi as unknown as AbiItem;

// Example script
const main = async () => {
  let user;
  let latestTokenId;

  try {
    // # 1 Create an instance of User (mnemonic is optional)
    user = await UserFactory.create({
      blockchainWsUrl: config.blockchainWsUrl,
      clientApiUrl: config.clientApiUrl,
      ethereumPrivateKey: config.ethereumPrivateKey,
      nightfallMnemonic: config.nightfallMnemonic,
    });
    const contract = new web3.eth.Contract(
      erc721AbiItem,
      config.tokenContractAddress,
    );

    //number of tokens owned by the address
    const balance = await contract.methods.balanceOf(user.ethAddress).call();

    // create an NFT to be deposited to Nightfall
    const tx = await contract.methods.awardItem(user.ethAddress, "test");

    const gas = await tx.estimateGas({
      from: user.ethAddress,
    });

    const gasPrice = await web3.eth.getGasPrice();
    const data = tx.encodeABI();
    const nonce = await web3.eth.getTransactionCount(user.ethAddress);
    const signedTx = await web3.eth.accounts.signTransaction(
      {
        to: config.tokenContractAddress,
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

    // get the tokenId from the created NFT to deposit it to Nightfall
    latestTokenId = await contract
      .getPastEvents("Transfer", {
        filter: {
          _from: user.ethAddress,
        },
        fromBlock: 0,
      })
      .then((events) => {
        const tokenIdToReturn = events[events.length - 1].returnValues.tokenId;
        console.log("The ID of the token to be deposited", tokenIdToReturn);

        return events[events.length - 1].returnValues.tokenId;
      });

    // # 4 Make ERC721 deposit
    const tokenContractAddress = config.tokenContractAddress;
    const tokenErcStandard = "ERC721";
    const tokenId = latestTokenId;

    // add only one to be required, not both value and tokenId
    const txReceipts = await user.makeDeposit({
      tokenContractAddress,
      tokenErcStandard,
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
