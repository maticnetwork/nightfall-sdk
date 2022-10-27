import type Web3 from "web3";
import type { Contract } from "web3-eth-contract";
import type { TokenOptions } from "./types";
import type { AbiItem } from "web3-utils";
/**
 * Detects ERC standard for a given contract address using ERC165
 *
 * @function whichTokenStandard
 * @param {string} contractAddress
 * @param {Web3} web3
 * @returns {string} "ERC20" | "ERC721" | "ERC1155"
 */
export declare function whichTokenStandard(contractAddress: string, web3: Web3): Promise<string>;
export declare class TokenFactory {
    static create(options: TokenOptions): Promise<Token>;
}
declare class Token {
    web3: Web3;
    contractAddress: string;
    ercStandard: string;
    contract: Contract;
    decimals: number;
    constructor(options: TokenOptions);
    getContractAbi(): AbiItem;
    setTokenContract(): void;
    setTokenDecimals(): Promise<void>;
    isTransactionApproved(owner: string, spender: string, value: string): Promise<boolean>;
    approvalUnsignedTransaction(spender: string): Promise<any>;
    approve(owner: string, spender: string): Promise<any>;
}
export {};
