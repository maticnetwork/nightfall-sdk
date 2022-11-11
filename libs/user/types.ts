import type { Client } from "../client";
import type { Web3Websocket } from "../ethereum";
import type { MetaMaskEthereumProvider } from "../ethereum/types";

export interface UserFactoryCreate {
  clientApiUrl: string;
  blockchainWsUrl?: string;
  ethereumPrivateKey?: string;
  nightfallMnemonic?: string;
}

export interface WhitelistManagerFactoryCreate {
  clientApiUrl: string;
  blockchainWsUrl?: string;
  ethereumPrivateKey?: string;
}

export interface UserCommonConstructor {
  client: Client;
  web3Websocket: Web3Websocket;
  kycContractAddress: string;
  ethPrivateKey: string;
  ethAddress: string;
}

export interface UserConstructor extends UserCommonConstructor {
  shieldContractAddress: string;
  nightfallMnemonic: string;
  zkpKeys: any;
}

export interface WhitelistManagerConstructor extends UserCommonConstructor {
  whitelistContractAddress: string;
}

export interface UserMakeTransaction {
  tokenContractAddress: string;
  tokenErcStandard?: string; // keep it for a while for compatibility
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

export interface EthAddress {
  ethAddress: string;
}

export interface UserValidateCertificate {
  derPrivateKey: string;
  certificate: string;
}