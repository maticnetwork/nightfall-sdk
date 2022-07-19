export interface Env {
  blockchainNetwork: string;
  blockchainWsUrl: string;
  clientApiUrl: string;
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

export interface UserExportCommitments {
  listOfCompressedZkpPublicKey: string[];
  pathToExport: string;
  fileName: string;
}
