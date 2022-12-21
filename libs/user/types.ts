import type { Client } from "../client";
import type { Web3Websocket } from "../ethereum";
import type { MetaMaskEthereumProvider } from "../ethereum/types";

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
  tokenErcStandard?: string; // keep it for a while for compatibility
  value?: string;
  tokenId?: string;
  feeWei?: string;
}

export interface UserL2TokenisationTransaction {
  tokenAddress: string;
  value: number;
  tokenId: number | string;
  feeWei?: string;
}

export type UserMakeDeposit = UserMakeTransaction;

export interface UserMintL2Token extends UserL2TokenisationTransaction {
  salt?: string;
}

export interface UserMakeTransfer extends UserMakeTransaction {
  recipientNightfallAddress: string;
  isOffChain?: boolean;
}

export type UserBurnL2Token = UserL2TokenisationTransaction;

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
