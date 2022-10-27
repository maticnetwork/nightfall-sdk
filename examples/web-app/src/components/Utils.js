import { UserFactory } from "nightfall-sdk";
import {
  erc1155ContractAddress,
  erc20ContractAddress,
  erc721ContractAddress,
  erc20value,
} from "./Constants";

const clientApiUrl = process.env.CLIENT_API_URL;

async function makeDeposit(e, nightfallMnemonic) {
  // Prevent default onClick behaviour that refreshes the page
  e.preventDefault();
  try {
    // Create a user to deposit funds
    const nightfallUser = await UserFactory.create({
      clientApiUrl,
      nightfallMnemonic,
    });

    // Make a deposit for the user
    const txReceipts = await nightfallUser.makeDeposit({
      tokenContractAddress: erc20ContractAddress,
      value: erc20value,
    });
    return txReceipts;
  } catch (error) {
    console.log(error);
  }
}

async function makeTransfer(e, nightfallMnemonic) {
  e.preventDefault();

  try {
    // Create a user that will transfer funds
    const nightfallUserSender = await UserFactory.create({
      clientApiUrl,
      nightfallMnemonic,
    });
    // Create a user that will recieve funds
    const nightfallUserRecepient = await UserFactory.create({
      clientApiUrl,
    });
    const recepientAddress = nightfallUserRecepient.getNightfallAddress();

    // Make a transfer to the Nightfall address of the recipient
    const txReceipts = await nightfallUserSender.makeTransfer({
      tokenContractAddress: erc20ContractAddress,
      value: erc20value,
      recipientNightfallAddress: recepientAddress,
      isOffChain: false,
    });
    return txReceipts;
  } catch (error) {
    console.log(error);
  }
}

async function makeWithdrawal(e, nightfallMnemonic) {
  e.preventDefault();

  try {
    // Create a user to make a withdrawal
    const nightfallUser = await UserFactory.create({
      clientApiUrl,
      nightfallMnemonic,
    });
    // Make a withdrawal to Layer 1
    const txReceipts = await nightfallUser.makeWithdrawal({
      tokenContractAddress: erc20ContractAddress,
      value: erc20value,
      recipientEthAddress: nightfallUser.ethAddress,
      feeWei: "0",
    });
    return txReceipts;
  } catch (error) {
    console.log(error);
  }
}

async function makeDepositERC721(e, nightfallMnemonic, tokenId) {
  e.preventDefault();

  try {
    // Create a user to make a deposit
    const nightfallUser = await UserFactory.create({
      clientApiUrl,
      nightfallMnemonic,
    });
    // Make an ERC721 deposit for the user
    const txReceipts = await nightfallUser.makeDeposit({
      tokenContractAddress: erc721ContractAddress,
      tokenId,
    });

    return txReceipts;
  } catch (error) {
    console.log(error);
  }
}

async function makeTransferERC721(e, nightfallMnemonic, tokenId) {
  e.preventDefault();

  // Create a user that will transfer ERC721
  try {
    const nightfallUserSender = await UserFactory.create({
      clientApiUrl,
      nightfallMnemonic,
    });
    // Create a user that will recieve ERC721
    const nightfallUserRecepient = await UserFactory.create({
      clientApiUrl,
    });

    const recepientAddress = nightfallUserRecepient.getNightfallAddress();

    // Make an ERC721 transfer to the Nightfall address of the recipient
    const txReceipts = await nightfallUserSender.makeTransfer({
      tokenContractAddress: erc721ContractAddress,
      tokenId,
      recipientNightfallAddress: recepientAddress,
      isOffChain: false,
    });
    return txReceipts;
  } catch (error) {
    console.log(error);
  }
}

async function makeWithdrawalERC721(e, nightfallMnemonic, tokenId) {
  e.preventDefault();

  try {
    // Create a user with clientApiUrl and nightfallMnemonic
    const nightfallUser = await UserFactory.create({
      clientApiUrl,
      nightfallMnemonic,
    });
    // Make an ERC721 withdrawal to Layer 1
    const txReceipts = await nightfallUser.makeWithdrawal({
      tokenContractAddress: erc721ContractAddress,
      tokenId,
      recipientEthAddress: nightfallUser.ethAddress,
      feeWei: "0",
    });
    return txReceipts;
  } catch (error) {
    console.log(error);
  }
}

async function makeDepositERC1155(e, nightfallMnemonic, tokenId, value) {
  e.preventDefault();

  try {
    // Create a user that will deposit ERC1155
    const nightfallUser = await UserFactory.create({
      clientApiUrl,
      nightfallMnemonic,
    });
    // Make a deposit for the user
    const txReceipts = await nightfallUser.makeDeposit({
      tokenContractAddress: erc1155ContractAddress,
      tokenId,
      value,
    });

    return txReceipts;
  } catch (error) {}
}

async function makeTransferERC1155(e, nightfallMnemonic, tokenId, value) {
  e.preventDefault();

  try {
    // Create a user that will transfer ERC1155
    const nightfallUserSender = await UserFactory.create({
      clientApiUrl,
      nightfallMnemonic,
    });
    // Create a user that will recieve ERC1155
    const nightfallUserRecepient = await UserFactory.create({
      clientApiUrl,
    });

    const recepientAddress = nightfallUserRecepient.getNightfallAddress();

    // Make an ERC1155 transfer to the Nightfall address of the recipient
    const txReceipts = await nightfallUserSender.makeTransfer({
      tokenContractAddress: erc1155ContractAddress,
      tokenId,
      value,
      recipientNightfallAddress: recepientAddress,
      isOffChain: false,
    });
    return txReceipts;
  } catch (error) {
    console.log(error);
  }
}

async function makeWithdrawalERC1155(e, nightfallMnemonic, tokenId, value) {
  e.preventDefault();

  try {
    // Create a user with clientApiUrl and nightfallMnemonic
    const nightfallUser = await UserFactory.create({
      clientApiUrl,
      nightfallMnemonic,
    });
    // Make an ERC1155 withdrawal to Layer 1
    const txReceipts = await nightfallUser.makeWithdrawal({
      tokenContractAddress: erc1155ContractAddress,
      tokenId,
      value,
      recipientEthAddress: nightfallUser.ethAddress,
      feeWei: "0",
    });
    return txReceipts;
  } catch (error) {
    console.log(error);
  }
}

async function checkBalances(nightfallMnemonic) {
  try {
    const nightfallUser = await UserFactory.create({
      clientApiUrl,
      nightfallMnemonic,
    });

    // Check the balances of the current user
    const balance = await nightfallUser.checkNightfallBalances();

    if (Object.keys(balance).length) {
      const balanceWei = Object.values(balance)[0][0].balance;
      localStorage.setItem("nightfallBalances", balanceWei);
      return balanceWei;
    }
    return 0;
  } catch (error) {
    console.log(error);
  }
}

async function createUserFirstTime() {
  try {
    const nightfallUser = await UserFactory.create({
      clientApiUrl,
    });
    console.log(nightfallUser);
    if (nightfallUser) {
      localStorage.setItem("userAddress", nightfallUser.ethAddress);
      localStorage.setItem(
        "nightfallUserAddress",
        nightfallUser.zkpKeys.compressedZkpPublicKey,
      );
      localStorage.setItem(
        "nightfallMnemonic",
        nightfallUser.nightfallMnemonic,
      );
      localStorage.setItem("clientApiUrl", nightfallUser.client.apiUrl);
    }
    return nightfallUser;
  } catch (error) {
    console.log(error);
  }
}

let createUser = async (nightfallMnemonic) => {
  try {
    const nightfallUser = await UserFactory.create({
      clientApiUrl,
      nightfallMnemonic,
    });
    const balances = await checkBalances(nightfallMnemonic);
    return nightfallUser;
  } catch (error) {
    console.log(error);
  }
};

export {
  makeDeposit,
  makeTransfer,
  makeWithdrawal,
  makeDepositERC721,
  makeTransferERC721,
  makeWithdrawalERC721,
  makeDepositERC1155,
  makeTransferERC1155,
  makeWithdrawalERC1155,
  createUserFirstTime,
  checkBalances,
  createUser,
};
