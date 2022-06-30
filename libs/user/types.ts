import { Client } from "../client";
import { Web3Websocket } from "../ethereum";

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
  zkpKeys: any; // TODO improve
}

export interface UserDeposit {
  tokenAddress: string;
  tokenStandard: string;
  value: string;
  fee?: number;
}
