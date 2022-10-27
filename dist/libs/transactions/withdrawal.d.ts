import type Web3 from "web3";
import type { Client } from "../client";
import type { NightfallZkpKeys } from "../nightfall/types";
import type { OffChainTransactionReceipt, OnChainTransactionReceipts } from "./types";
/**
 * Handle the flow for withdrawal transaction (tx)
 *
 * @async
 * @function createAndSubmitWithdrawal
 * @param {*} token An instance of Token holding token data such as contract address
 * @param {string} ownerEthAddress Eth address sending the contents of the withdrawal
 * @param {undefined | string} ownerEthPrivateKey Eth private key of the sender to sign the tx
 * @param {NightfallZkpKeys} ownerZkpKeys Sender's set of Zero-knowledge proof keys
 * @param {string} shieldContractAddress Address of the Shield smart contract
 * @param {Web3} web3 web3js instance
 * @param {Client} client An instance of Client to interact with the API
 * @param {string} value The amount in Wei of the token to be withdrawn
 * @param {string} tokenId The id of the ERC721 to be withdrawn
 * @param {string} fee The amount in Wei to pay a proposer for the tx
 * @param {string} recipientEthAddress Recipient Eth address
 * @param {boolean} isOffChain If true, tx will be sent to the proposer's API (handled off-chain)
 * @throws {NightfallSdkError} Error while broadcasting on-chain tx
 * @returns {Promise<OnChainTransactionReceipts | OffChainTransactionReceipt>}
 */
export declare function createAndSubmitWithdrawal(token: any, ownerAddress: string, ownerEthPrivateKey: undefined | string, ownerZkpKeys: NightfallZkpKeys, shieldContractAddress: string, web3: Web3, client: Client, value: string, tokenId: string, fee: string, recipientEthAddress: string, isOffChain: boolean): Promise<OnChainTransactionReceipts | OffChainTransactionReceipt>;
