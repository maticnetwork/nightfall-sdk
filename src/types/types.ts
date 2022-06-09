import Web3 from "web3";

export interface Env {
  blockchainNetwork: string;
  blockchainWs: string;
  apiUrl: string;
}

export interface TokenOptions {
  web3: Web3;
  address: string;
  name?: string;
}

export interface UserConfig {
  ethereumPrivateKey: string;
  nightfallMnemonic?: string;
}
