import type { Client } from "../client";
import type { Web3Websocket } from "../ethereum";
import type { NightfallZkpKeys } from "../nightfall/types";

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
  zkpKeys: any; // NightfallZkpKeys might have to be declared as class??;
}

export interface UserDeposit {
  tokenAddress: string;
  tokenStandard: string;
  value: string;
  fee?: number;
}
