import Web3 from "web3";

export interface Env {
  blockchainNetwork: string;
  blockchainWs: string;
  apiUrl: string;
}

export interface NetworkConfig {
  tokens: { [key: string]: NetworkTokenConfig };
}

export interface NetworkTokenConfig {
  contractAbi: string;
  contractAddress: string;
}

export interface TokenOptions {
  web3: Web3;
  name: string;
  config: NetworkTokenConfig;
}

export interface UserConfig {
  ethereumPrivateKey: string;
  tokenName: string;
  nightfallMnemonic?: string;
}
