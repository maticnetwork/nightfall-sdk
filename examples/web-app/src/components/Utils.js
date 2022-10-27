import { UserFactory } from "nightfall-sdk";
import {
  erc1155ContractAddress,
  erc20ContractAddress,
  erc721ContractAddress,
  erc20value,
} from "./Constants";
const clientApiUrl = process.env.CLIENT_API_URL;

async function makeDeposit(e, nightfallMnemonic) {
  e.preventDefault();
  // Create a user with clientApiUrl and nightfallMnemonic
  // Prevent default onClick behaviour that refreshes the page
  try {
    const nightfallUser = await UserFactory.create({
      clientApiUrl,
      nightfallMnemonic,
    });

    // Make a deposit for the user
    const txReceipts = await nightfallUser.makeDeposit({
      tokenContractAddress: erc20ContractAddress,
      tokenErcStandard: "ERC20",
      value: erc20value,
    });
    return txReceipts;
  } catch (error) {
    console.log(error);
  }
}

async function makeTransfer(e, nightfallMnemonic) {
  e.preventDefault();

  // Create a user that will transfer funds
  try {
    const nightfallUserSender = await UserFactory.create({
      clientApiUrl,
      nightfallMnemonic,
    });
    // Create a user that will recieve funds
    const nightfallUserRecepient = await UserFactory.create({
      clientApiUrl,
    });
    const recepientAddress = nightfallUserRecepient.getNightfallAddress();

    // Make a transfer to the nightfall address of the recipient
    const txReceipts = await nightfallUserSender.makeTransfer({
      tokenContractAddress: erc20ContractAddress,
      tokenErcStandard: "ERC20",
      value: erc20value,
      recipientNightfallAddress: recepientAddress,
      isOffChain: true,
    });
    return txReceipts;
  } catch (error) {
    console.log(error);
  }
}

async function makeWithdrawal(e, nightfallMnemonic) {
  e.preventDefault();

  // Create a user with clientApiUrl and nightfallMnemonic
  try {
    const nightfallUser = await UserFactory.create({
      clientApiUrl,
      nightfallMnemonic,
    });

    const txReceipts = await nightfallUser.makeWithdrawal({
      tokenContractAddress: erc20ContractAddress,
      tokenErcStandard: "ERC20",
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
    const nightfallUser = await UserFactory.create({
      clientApiUrl,
      nightfallMnemonic,
    });
    // Make a deposit for the user
    const txReceipts = await nightfallUser.makeDeposit({
      tokenContractAddress: erc721ContractAddress,
      tokenErcStandard: "ERC721",
      tokenId,
    });

    return txReceipts;
  } catch (error) {
    console.log(error);
  }
}

async function makeTransferERC721(e, nightfallMnemonic, tokenId) {
  e.preventDefault();

  // Create a user that will transfer erc721
  try {
    const nightfallUserSender = await UserFactory.create({
      clientApiUrl,
      nightfallMnemonic,
    });
    // Create a user that will recieve erc721
    const nightfallUserRecepient = await UserFactory.create({
      clientApiUrl,
    });

    const recepientAddress = nightfallUserRecepient.getNightfallAddress();

    // Make a transfer to the nightfall address of the recipient
    const txReceipts = await nightfallUserSender.makeTransfer({
      tokenContractAddress: erc721ContractAddress,
      tokenErcStandard: "ERC721",
      tokenId,
      recipientNightfallAddress: recepientAddress,
      isOffChain: true,
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

    const txReceipts = await nightfallUser.makeWithdrawal({
      tokenContractAddress: erc721ContractAddress,
      tokenErcStandard: "ERC721",
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
      tokenErcStandard: "ERC1155",
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

    // Make a transfer to the nightfall address of the recipient
    const txReceipts = await nightfallUserSender.makeTransfer({
      tokenContractAddress: erc1155ContractAddress,
      tokenErcStandard: "ERC1155",
      tokenId,
      value,
      recipientNightfallAddress: recepientAddress,
      isOffChain: true,
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

    const txReceipts = await nightfallUser.makeWithdrawal({
      tokenContractAddress: erc1155ContractAddress,
      tokenErcStandard: "ERC1155",
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

async function createUserFirstTime() {
  try {
    const nightfallUser = await UserFactory.create({
      clientApiUrl,
    });
  } catch (error) {
    console.log(error);
  }

  if (nightfallUser) {
    localStorage.setItem("userAddress", nightfallUser.ethAddress);
    localStorage.setItem(
      "nightfallUserAddress",
      nightfallUser.zkpKeys.compressedZkpPublicKey,
    );
    localStorage.setItem("nightfallMnemonic", nightfallUser.nightfallMnemonic);
    localStorage.setItem("clientApiUrl", nightfallUser.client.apiUrl);
  }
}

async function checkBalances(nightfallMnemonic) {
  try {
    const nightfallUser = await UserFactory.create({
      clientApiUrl,
      nightfallMnemonic,
    });

    const balance = await nightfallUser.checkNightfallBalances();

    if (Object.keys(balance)) {
      const balanceWei = Object.values(balance)[0][0].balance;
      localStorage.setItem("nightfallBalances", balanceWei);
      return balanceWei;
    }
    return 0;
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
