import Web3 from "web3";

export interface TokenOptions {
  web3: Web3;
  address: string;
  standard: string;
}