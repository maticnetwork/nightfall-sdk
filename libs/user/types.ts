import type { Client } from "../client";
import type { Web3Websocket } from "../ethereum";
import type { TransactionReceipt } from "web3-core";
import { Transaction } from "libs/types";

export interface UserFactoryOptions {
  blockchainWsUrl: string;
  clientApiUrl: string;
  ethereumPrivateKey: string;
  nightfallMnemonic?: string;
}

export interface UserOptions {
  client: Client;
  web3Websocket: Web3Websocket;
  shieldContractAddress: string;
  ethPrivateKey: string;
  ethAddress: string;
  nightfallMnemonic: string;
  zkpKeys: any; // TODO NightfallZkpKeys might have to be declared as class??;
}

export interface UserMakeDepositOptions {
  tokenAddress: string;
  tokenStandard: string;
  value: string;
  feeGwei?: string;
}

export interface UserMakeTransefrOptions {
  tokenAddress: string;
  tokenStandard: string;
  value: string;
  feeGwei?: string;
  recipientAddress: string;
  offchain: boolean;
}

export interface RecipientData {
  recipientCompressedZkpPublicKeys: string[];
  values: string[];
}

export interface UserMakeTransfer {
  ercAddress: string;
  tokenId: string;
  tokenType: string;
  recipientData: RecipientData;
  rootKey: string;
  fee: string;
  offchain: boolean;
}

export interface UserExportCommitments {
  listOfCompressedZkpPublicKey: string[];
  pathToExport: string;
  fileName: string;
}

export interface TransferReceipts {
  txL1: TransactionReceipt;
  txL2: Transaction;
}
