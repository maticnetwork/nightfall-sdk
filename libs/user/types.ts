export interface Env {
  blockchainNetwork: string;
  blockchainWs: string;
  apiUrl: string;
}

export interface UserConfig {
  ethereumPrivateKey: string;
  nightfallMnemonic?: string;
}

export interface UserDeposit {
  tokenAddress: string;
  tokenStandard: string;
  value: string;
  fee?: number;
}
