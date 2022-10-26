import { UserFactory } from "nightfall-sdk";
import React, { useState, useEffect } from "react";

let currentERC;
const erc20ContractAddress = "0xe721F2D97c58b1D1ccd0C80B88256a152d27f0Fe";
const erc721ContractAddress = "0x7F68ba0dB1D62fB166758Fe5Ef10853537F8DFc5";
const erc1155ContractAddress = "0xdA0107986bC43E207D0Bb4D9c9a22d35e09db425";

async function makeDeposit(e, clientApiUrl, nightfallMnemonic) {
  // Create a user with clientApiUrl and nightfallMnemonic
  e.preventDefault();
  const nightfallUser = await UserFactory.create({
    clientApiUrl,
    nightfallMnemonic,
  });

  // Make a deposit for the user
  const txReceipts = await nightfallUser.makeDeposit({
    tokenContractAddress: erc20ContractAddress,
    tokenErcStandard: "ERC20",
    value: "0.0001",
  });

  return txReceipts;
}

async function makeTransfer(e, clientApiUrl, nightfallMnemonic) {
  e.preventDefault();
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

  // Make a transfer to the nightfall address of the recipient
  const txReceipts = await nightfallUserSender.makeTransfer({
    tokenContractAddress: erc20ContractAddress,
    tokenErcStandard: "ERC20",
    value: "0.0001",
    recipientNightfallAddress: recepientAddress,
    isOffChain: true,
  });
  return txReceipts;
}
async function makeWithdrawal(e, clientApiUrl, nightfallMnemonic) {
  e.preventDefault();

  // Create a user with clientApiUrl and nightfallMnemonic
  const nightfallUser = await UserFactory.create({
    clientApiUrl,
    nightfallMnemonic,
  });

  const txReceipts = await nightfallUser.makeWithdrawal({
    tokenContractAddress: erc20ContractAddress,
    tokenErcStandard: "ERC20",
    value: "0.0001",
    recipientEthAddress: nightfallUser.ethAddress,
    feeWei: "0",
  });
}

async function makeDepositERC721(e, clientApiUrl, nightfallMnemonic, tokenId) {
  e.preventDefault();
  const nightfallUser = await UserFactory.create({
    clientApiUrl,
    nightfallMnemonic,
  });
  // Make a deposit for the user
  const txReceipts = await nightfallUser.makeDeposit({
    tokenContractAddress: erc721ContractAddress,
    tokenErcStandard: "ERC721",
    tokenId: tokenId,
  });

  return txReceipts;
}
async function makeTransferERC721(e, clientApiUrl, nightfallMnemonic, tokenId) {
  e.preventDefault();

  // Create a user that will transfer erc721
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
    tokenId: tokenId,
    recipientNightfallAddress: recepientAddress,
    isOffChain: true,
  });
  return txReceipts;
}
async function makeWithdrawalERC721(
  e,
  clientApiUrl,
  nightfallMnemonic,
  tokenId,
) {
  e.preventDefault();

  // Create a user with clientApiUrl and nightfallMnemonic
  const nightfallUser = await UserFactory.create({
    clientApiUrl,
    nightfallMnemonic,
  });

  const txReceipts = await nightfallUser.makeWithdrawal({
    tokenContractAddress: erc721ContractAddress,
    tokenErcStandard: "ERC721",
    tokenId: tokenId,
    recipientEthAddress: nightfallUser.ethAddress,
    feeWei: "0",
  });
}

async function makeDepositERC1155(
  e,
  clientApiUrl,
  nightfallMnemonic,
  tokenId,
  value,
) {
  e.preventDefault();

  const nightfallUser = await UserFactory.create({
    clientApiUrl,
    nightfallMnemonic,
  });
  // Make a deposit for the user
  const txReceipts = await nightfallUser.makeDeposit({
    tokenContractAddress: erc1155ContractAddress,
    tokenErcStandard: "ERC1155",
    tokenId: tokenId,
    value: value,
  });

  return txReceipts;
}
async function makeTransferERC1155(
  e,
  clientApiUrl,
  nightfallMnemonic,
  tokenId,
  value,
) {
  e.preventDefault();

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

  // Make a transfer to the nightfall address of the recipient
  const txReceipts = await nightfallUserSender.makeTransfer({
    tokenContractAddress: erc1155ContractAddress,
    tokenErcStandard: "ERC1155",
    tokenId: tokenId,
    value: value,
    recipientNightfallAddress: recepientAddress,
    isOffChain: true,
  });
  return txReceipts;
}
async function makeWithdrawalERC1155(
  e,
  clientApiUrl,
  nightfallMnemonic,
  tokenId,
  value,
) {
  e.preventDefault();

  // Create a user with clientApiUrl and nightfallMnemonic
  const nightfallUser = await UserFactory.create({
    clientApiUrl,
    nightfallMnemonic,
  });

  const txReceipts = await nightfallUser.makeWithdrawal({
    tokenContractAddress: erc1155ContractAddress,
    tokenErcStandard: "ERC1155",
    tokenId: tokenId,
    value: value,
    recipientEthAddress: nightfallUser.ethAddress,
    feeWei: "0",
  });
}

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
};
