import { UserFactory } from "../../../libs/user";
import { config } from "../appConfig";
import erc721Abi from "../../../libs/tokens/abis/ERC721.json";
import type { AbiItem } from "web3-utils";

const erc721AbiItem = erc721Abi as unknown as AbiItem;

// Util for minting 721
const main = async () => {
  let user;

  try {
    // # 1 Create an instance of User (mnemonic is optional)
    // Not providing an existing mnemonic creates a new Nightfall user
    user = await UserFactory.create({
      clientApiUrl: config.clientApiUrl,
      nightfallMnemonic: config.nightfallMnemonic,
      ethereumPrivateKey: config.ethereumPrivateKey,
      blockchainWsUrl: config.blockchainWsUrl,
    });
    const web3 = user.web3Websocket.web3;

    // # 2 Recreate contract
    const contract = new web3.eth.Contract(
      erc721AbiItem,
      config.tokenContractAddress,
    );

    // # 3 Mint an NFT to be deposited to Nightfall
    const unsignedTx = await contract.methods.awardItem(
      user.ethAddress,
      "test",
    );
    const gas = await unsignedTx.estimateGas();
    const tx = {
      from: user.ethAddress,
      to: config.tokenContractAddress,
      data: unsignedTx.encodeABI(),
      gas,
    };
    const signedTx = await web3.eth.accounts.signTransaction(
      tx,
      config.ethereumPrivateKey,
    );
    const txReceipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction,
    );
    console.log("Transaction receipt", txReceipt);

    // # 4 Get the tokenId from the created NFT
    const events = await contract.getPastEvents("Transfer", {
      filter: {
        _from: user.ethAddress,
      },
      fromBlock: 0,
    });
    const tokenId = events[events.length - 1].returnValues.tokenId;
    console.log("The ID of the token to be deposited", tokenId);
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    user.close();
    console.log("Bye bye");
  }
};

main();
