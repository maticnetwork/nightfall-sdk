import { NightfallZkpKeys } from "libs/nightfall/types";
import {
  OffChainTransactionReceipt,
  OnChainTransactionReceipts,
} from "libs/transactions/types";
import type { Client } from "../client";
import type { Web3Websocket } from "../ethereum";
import type { MetaMaskEthereumProvider } from "../ethereum/types";
import type { TransactionReceipt } from "web3-core";

export interface UserFactoryCreate {
  clientApiUrl: string;
  blockchainWsUrl?: string;
  ethereumPrivateKey?: string;
  nightfallMnemonic?: string;
}

export interface UserConstructor {
  client: Client;
  web3Websocket: Web3Websocket;
  shieldContractAddress: string;
  ethPrivateKey: string;
  ethAddress: string;
  nightfallMnemonic: string;
  zkpKeys: any;
}

export interface UserMakeTransaction {
  tokenContractAddress: string;
  tokenErcStandard: string;
  value?: string;
  tokenId?: string;
  feeWei?: string;
}

export type UserMakeDeposit = UserMakeTransaction;

export interface UserMakeTransfer extends UserMakeTransaction {
  recipientNightfallAddress: string;
  isOffChain?: boolean;
}

export interface UserMakeWithdrawal extends UserMakeTransaction {
  recipientEthAddress: string;
  isOffChain?: boolean;
}

export interface UserFinaliseWithdrawal {
  withdrawTxHashL2?: string;
}

export interface UserCheckBalances {
  tokenContractAddresses?: string[];
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

export interface UserBrowser extends Window {
  ethereum?: MetaMaskEthereumProvider;
}

export type User = {
  client: Client;
  web3Websocket: Web3Websocket;
  shieldContractAddress: string;
  ethPrivateKey: string;
  ethAddress: string;
  nightfallMnemonic: string;
  zkpKeys: NightfallZkpKeys;

  // Set when transacting
  token: any;
  nightfallDepositTxHashes: string[];
  nightfallTransferTxHashes: string[];
  nightfallWithdrawalTxHashes: string[];

  checkStatus(): Promise<{}>;
  getNightfallMnemonic(): string;
  getNightfallAddress(): string;
  updateEthAccountFromMetamask(): void;
  makeDeposit(options: UserMakeDeposit): Promise<OnChainTransactionReceipts>;
  makeTransfer(
    options: UserMakeTransfer,
  ): Promise<OnChainTransactionReceipts | OffChainTransactionReceipt>;
  makeWithdrawal(
    options: UserMakeWithdrawal,
  ): Promise<OnChainTransactionReceipts | OffChainTransactionReceipt>;
  finaliseWithdrawal(
    options: UserFinaliseWithdrawal,
  ): Promise<TransactionReceipt>;
  checkPendingDeposits(options?: UserCheckBalances): Promise<any>;
  checkNightfallBalances(): Promise<any>;
  checkPendingTransfers(): Promise<any>;
  exportCommitments(options: UserExportCommitments): Promise<void | null>;
  importAndSaveCommitments(options: UserImportCommitments): Promise<string>;
  close(): void;
};

export type Balance = {
  balance: number;
  tokenId: string;
};
