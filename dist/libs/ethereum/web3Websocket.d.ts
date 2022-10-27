import Web3 from "web3";
import type { WebsocketProvider } from "web3-core";
import type { MetaMaskEthereumProvider } from "./types";
declare function isMetaMaskAvailable(): void;
declare class Web3Websocket {
    provider: MetaMaskEthereumProvider | WebsocketProvider;
    web3: Web3;
    intervalIds: ReturnType<typeof setInterval>[];
    blocknumber: number;
    constructor(wsUrl?: string);
    setEthConfig(): void;
    addWsEventListeners(): void;
    checkWsConnection(): void;
    updateWeb3Provider(): void;
    refreshWsConnection(): void;
    setEthBlockNo(): Promise<number>;
    close(): void;
    clearIntervalIds(): void;
    closeWsConnection(): void;
}
export { Web3Websocket, isMetaMaskAvailable };
