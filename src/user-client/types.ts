export interface Env {
  clientApiUrl: string,
  web3WsUrl: string,
}

export interface UserConfig {
  ethereumPrivateKey: string;
  tokenStandard: string;
  nightfallMnemonic?: string;
}
