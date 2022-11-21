import type { Commitment } from "../nightfall/types";
import type { NightfallZkpKeys } from "../nightfall/types";
import type { RecipientNightfallData } from "libs/transactions/types";
import { TransactionResponseData } from "./types";
/**
 * Creates a new Client
 *
 * @class Client
 */
declare class Client {
    /**
     * @property {string} apiUrl client address
     */
    apiUrl: string;
    /**
     * Client constructor
     *
     * @param  {string} apiUrl client address
     */
    constructor(apiUrl: string);
    /**
     * Make GET request to check that API is alive
     *
     * @method healthCheck
     * @throws {NightfallSdkError} Response other than 200 or bad response
     * @returns {Promise<boolean>} Should resolve `true` if API is alive, else `false`
     */
    healthCheck(): Promise<boolean>;
    /**
     * Make GET request to get the address for a given contract name
     *
     * @async
     * @method getContractAddress
     * @param {string} contractName The name of the contract for which we need the address
     * @throws {NightfallSdkError} Bad response
     * @returns {Promise<string>} Should resolve into Eth contract address
     */
    getContractAddress(contractName: string): Promise<string>;
    /**
     * Make POST request to get a set of Zero-knowledge proof keys
     *
     * @method generateZkpKeysFromMnemonic
     * @param {string} validMnemonic A valid bip39 mnemonic
     * @param {number} addressIndex Pass `0` to generate the first account
     * @throws {NightfallSdkError} Bad response
     * @returns {Promise<NightfallZkpKeys>} Should resolve into a set of keys if request is successful
     */
    generateZkpKeysFromMnemonic(validMnemonic: string, addressIndex: number): Promise<NightfallZkpKeys>;
    /**
     * Make POST request to subscribe to incoming viewing keys
     *
     * @method subscribeToIncomingViewingKeys
     * @param {NightfallZkpKeys} zkpKeys A set of Zero-knowledge proof keys
     * @throws {NightfallSdkError} Bad response
     * @returns {Promise<string>} Should resolve `string` (success) if request is successful
     */
    subscribeToIncomingViewingKeys(zkpKeys: NightfallZkpKeys): Promise<string>;
    /**
     * Make POST request to create a deposit transaction (tx)
     *
     * @async
     * @method deposit
     * @param {*} token An instance of Token holding token data such as contract address
     * @param {NightfallZkpKeys} ownerZkpKeys Sender's set of Zero-knowledge proof keys
     * @param {string} value The amount in Wei of the token to be deposited
     * @param {string} tokenId The tokenId of the token to be deposited
     * @param {string} fee Proposer payment for the tx in L2
     * @throws {NightfallSdkError} Bad response
     * @returns {Promise<TransactionResponseData>}
     */
    deposit(token: any, ownerZkpKeys: NightfallZkpKeys, value: string, tokenId: string, fee: string): Promise<TransactionResponseData>;
    /**
     * Make POST request to create a transfer transaction (tx)
     *
     * @async
     * @method transfer
     * @param {*} token An instance of Token holding token data such as contract address
     * @param {NightfallZkpKeys} ownerZkpKeys Sender's set of Zero-knowledge proof keys
     * @param {RecipientNightfallData} recipientNightfallData An object with [valueWei], [recipientCompressedZkpPublicKey]
     * @param {string} tokenId The tokenId of the token to be transferred
     * @param {string} fee The amount in Wei to pay a proposer for the tx
     * @param {boolean} isOffChain If true, tx will be sent to the proposer's API (handled off-chain)
     * @throws {NightfallSdkError} No commitments found or bad response
     * @returns {Promise<TransactionResponseData>}
     */
    transfer(token: any, ownerZkpKeys: NightfallZkpKeys, recipientNightfallData: RecipientNightfallData, tokenId: string, fee: string, isOffChain: boolean): Promise<TransactionResponseData>;
    /**
     * Make POST request to create a withdrawal transaction (tx)
     *
     * @async
     * @method withdraw
     * @param {*} token An instance of Token holding token data such as contract address
     * @param {NightfallZkpKeys} ownerZkpKeys Sender's set of Zero-knowledge proof keys
     * @param {string} value The amount in Wei of the token to be withdrawn
     * @param {string} tokenId The tokenId of the token to be withdrawn
     * @param {string} fee The amount in Wei to pay a proposer for the tx
     * @param {boolean} isOffChain If true, tx will be sent to the proposer's API (handled off-chain)
     * @throws {NightfallSdkError} Bad response
     * @returns {Promise<TransactionResponseData>}
     */
    withdraw(token: any, ownerZkpKeys: NightfallZkpKeys, value: string, tokenId: string, fee: string, recipientEthAddress: string, isOffChain: boolean): Promise<TransactionResponseData>;
    /**
     * Make POST request to finalise a previously initiated withdrawal (tx)
     *
     * @async
     * @method finaliseWithdrawal
     * @param {string} withdrawTxHashL2 Tx hash in Layer2 of the previously initiated withdrawal
     * @throws {NightfallSdkError} Bad response
     * @returns {Promise<TransactionResponseData>}
     */
    finaliseWithdrawal(withdrawTxHashL2: string): Promise<any>;
    /**
     * Make GET request to get aggregated value for deposits that have not settled in L2 yet
     *
     * @async
     * @method getPendingDeposits
     * @param {NightfallZkpKeys} zkpKeys Sender's set of Zero-knowledge proof keys
     * @param {string[]} tokenContractAddresses A list of token addresses
     * @throws {NightfallSdkError} Bad response
     * @returns {*}
     */
    getPendingDeposits(zkpKeys: NightfallZkpKeys, tokenContractAddresses: string[]): Promise<any>;
    getNightfallBalances(zkpKeys: NightfallZkpKeys): Promise<any>;
    getPendingTransfers(zkpKeys: NightfallZkpKeys): Promise<any>;
    /**
     * Make POST request to get all commitments filtered by many Nightfall addresses
     *
     * @method getCommitmentsByCompressedZkpPublicKey
     * @param {string[]} listOfCompressedZkpPublicKey list of compressedZkpPublicKeys (Nightfall address)
     * @throws {NightfallSdkError} No compressedZkpPublicKey given or bad response
     * @returns {Promise<Commitment[]>} Should resolve into a list of all existing commitments if request is successful
     */
    getCommitmentsByCompressedZkpPublicKey(listOfCompressedZkpPublicKey: string[]): Promise<Commitment[]>;
    /**
     *
     * Make POST request to import a list of commitments
     *
     * @async
     * @method saveCommitments
     * @param {Commitment[]} listOfCommitments Commitments to be saved in the database
     * @throws {NightfallSdkError} Bad response
     * @return {Promise<string>} Should resolve `string` (successMessage)
     */
    saveCommitments(listOfCommitments: Commitment[]): Promise<any>;
}
export default Client;
