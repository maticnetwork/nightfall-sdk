import type { Client } from "../client";
import type { Web3Websocket } from "../ethereum";
import type { NightfallZkpKeys } from "../nightfall/types";

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

export interface UserMakeDeposit {
  tokenAddress: string;
  tokenStandard: string;
  value: string;
  feeGwei?: string;
}

export interface UserMakeWithdrawal extends UserMakeDeposit {
  recipientAddress: string;
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
