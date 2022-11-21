import type Web3 from "web3";
import type { Client } from "../client";
import type { NightfallZkpKeys } from "../nightfall/types";
import type { OnChainTransactionReceipts } from "./types";
/**
 * Handle the flow for deposit transaction (tx)
 *
 * @async
 * @function createAndSubmitDeposit
 * @param {*} token An instance of Token holding token data such as contract address
 * @param {string} ownerEthAddress Eth address sending the contents of the deposit
 * @param {undefined | string} ownerEthPrivateKey Eth private key of the sender to sign the tx
 * @param {NightfallZkpKeys} ownerZkpKeys Sender's set of Zero-knowledge proof keys
 * @param {string} shieldContractAddress Address of the Shield smart contract (recipient)
 * @param {Web3} web3 web3js instance
 * @param {Client} client An instance of Client to interact with the API
 * @param {string} value The amount in Wei of the token to be deposited
 * @param {string} tokenId The tokenId of an erc721
 * @param {string} feeL1 Proposer payment for the tx in L1
 * @param {string} feeL2 Proposer payment for the tx in L2
 * @throws {NightfallSdkError} Error while broadcasting tx
 * @returns {Promise<OnChainTransactionReceipts>}
 */
export declare function createAndSubmitDeposit(token: any, ownerEthAddress: string, ownerEthPrivateKey: undefined | string, ownerZkpKeys: NightfallZkpKeys, shieldContractAddress: string, web3: Web3, client: Client, value: string, tokenId: string, feeL1: string, feeL2: string): Promise<OnChainTransactionReceipts>;
