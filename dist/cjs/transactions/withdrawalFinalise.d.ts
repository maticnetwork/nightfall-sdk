import type Web3 from "web3";
import type { Client } from "../client";
import type { TransactionReceipt } from "web3-core";
/**
 * Handle the flow for finalising previously initiated withdrawal transaction (tx)
 *
 * @async
 * @function createAndSubmitFinaliseWithdrawal
 * @param {string} ownerEthAddress Eth address sending the contents of the tx
 * @param {undefined | string} ownerEthPrivateKey Eth private key of the sender to sign the tx
 * @param {string} shieldContractAddress Address of the Shield smart contract
 * @param {Web3} web3 web3js instance
 * @param {Client} client An instance of Client to interact with the API
 * @param {string} withdrawTxHashL2 Tx hash in Layer2 of the previously initiated withdrawal
 * @throws {NightfallSdkError} Error while broadcasting tx
 * @returns {Promise<TransactionReceipt>}
 */
export declare function createAndSubmitFinaliseWithdrawal(ownerEthAddress: string, ownerEthPrivateKey: undefined | string, shieldContractAddress: string, web3: Web3, client: Client, withdrawTxHashL2: string): Promise<TransactionReceipt>;
