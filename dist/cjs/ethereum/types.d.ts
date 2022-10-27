import type { AbstractProvider } from "web3-core";
export interface MetaMaskEthereumProvider extends AbstractProvider {
    isMetaMask: boolean;
    isConnected(): boolean;
    on(eventName: string | symbol, listener: (...args: any[]) => void): this;
}
