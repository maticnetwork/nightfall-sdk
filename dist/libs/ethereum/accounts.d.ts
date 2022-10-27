import type Web3 from "web3";
import type { Web3Websocket } from "./web3Websocket";
/**
 * Recreate an Ethereum account from a given private key and return the address
 *
 * @function getEthAccountAddress
 * @param {string} ethereumPrivateKey
 * @param {Web3} web3
 * @throws {NightfallSdkError} Error while validating eth private key
 * @returns {string} Eth account address
 */
export declare function getEthAccountAddress(ethereumPrivateKey: string, web3: Web3): string;
export declare function getEthAccountFromMetaMask(ws: Web3Websocket): Promise<any>;
