import type Web3 from "web3";
/**
 * Determine ERC standard
 * Set value/tokenId defaults
 * Create an instance of Token
 * Convert value to Wei if needed
 *
 * @function whichTokenStandard
 * @param {string} contractAddress
 * @param {Web3} web3
 * @returns {string} "ERC20" | "ERC721" | "ERC1155"
 */
export declare function prepareTokenValueTokenId(contractAddress: string, value: string, tokenId: string, web3: Web3): Promise<{
    token: {
        web3: Web3;
        contractAddress: string;
        ercStandard: string;
        contract: import("web3-eth-contract").Contract;
        decimals: number;
        getContractAbi(): import("web3-utils").AbiItem;
        setTokenContract(): void;
        setTokenDecimals(): Promise<void>;
        isTransactionApproved(owner: string, spender: string, value: string): Promise<boolean>;
        approvalUnsignedTransaction(spender: string): Promise<any>;
        approve(owner: string, spender: string): Promise<any>;
    };
    valueWei: string;
    tokenId: string;
}>;
