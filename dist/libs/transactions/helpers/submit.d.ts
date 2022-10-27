import type Web3 from "web3";
import type { TransactionReceipt } from "web3-core";
/**
 * Create, sign and broadcast an Ethereum transaction (tx) to the network
 *
 * @async
 * @function submitTransaction
 * @param {string} senderEthAddress Eth address sending the contents of the tx
 * @param {undefined | string} senderEthPrivateKey Eth private key of the sender to sign the tx
 * @param {string} recipientEthAddress Eth address receiving the contents of the tx
 * @param {string} unsignedTx The contents of the tx (sent in data)
 * @param {Web3} web3 web3js instance
 * @param {string} fee The amount in Wei to pay a proposer for the tx
 * @returns {Promise<TransactionReceipt>}
 */
export declare function submitTransaction(senderEthAddress: string, senderEthPrivateKey: undefined | string, recipientEthAddress: string, unsignedTx: string, web3: Web3, fee?: string): Promise<TransactionReceipt>;
