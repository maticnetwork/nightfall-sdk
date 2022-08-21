import type { Client } from "../client";
import type { Web3Websocket } from "../ethereum";

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
  tokenContractAddress: string;
  tokenErcStandard: string;
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

export interface UserCheckBalances {
  tokenContractAddresses?: string[];
}

export interface UserExportCommitments {
  listOfCompressedZkpPublicKey: string[];
  pathToExport: string;
  fileName: string;
}
