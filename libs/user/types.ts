import type { Client } from "../client";
import type { Web3Websocket } from "../ethereum";
import type { TransactionReceipt } from "web3-core";
import { Transaction } from "../types";

export interface UserFactoryCreate {
  blockchainWsUrl: string;
  clientApiUrl: string;
  ethereumPrivateKey: string;
  nightfallMnemonic?: string;
}

export interface UserConstructor {
  client: Client;
  web3Websocket: Web3Websocket;
  shieldContractAddress: string;
  ethPrivateKey: string;
  ethAddress: string;
  nightfallMnemonic: string;
  zkpKeys: any; // TODO NightfallZkpKeys might have to be declared as class??;
}

export interface UserMakeTransaction {
  tokenAddress: string;
  tokenStandard: string;
  value: string;
  feeWei?: string;
}

export type UserMakeDeposit = UserMakeTransaction;

export interface UserMakeTransfer extends UserMakeTransaction {
  nightfallRecipientAddress: string;
  isOffChain?: boolean;
}

export interface UserMakeWithdrawal extends UserMakeTransaction {
  ethRecipientAddress: string;
  isOffChain?: boolean;
}

export interface UserFinaliseWithdrawal {
  withdrawTxHash?: string;
}

export interface UserExportCommitments {
  listOfCompressedZkpPublicKey: string[];
  pathToExport: string;
  fileName: string;
}

export interface UserImportCommitments {
  pathToImport: string;
  fileName: string;
  compressedZkpPublicKey: string;
}

export interface TransferReceipts {
  txL1: TransactionReceipt;
  txL2: Transaction;
}
