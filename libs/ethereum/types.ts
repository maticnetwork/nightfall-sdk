import type { AbstractProvider } from "web3-core";

// Using AbstractProvider to silence ts errors,
// AbstractProvider is not completely synced with the Ethereum Provider API
// https://docs.metamask.io/guide/ethereum-provider.html
export interface MetaMaskEthereumProvider extends AbstractProvider {
  isMetaMask: boolean;
  isConnected(): boolean;
  on(eventName: string | symbol, listener: (...args: any[]) => void): this;
}
