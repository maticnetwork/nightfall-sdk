import { UserFactoryCreate, UserConstructor, UserMakeDeposit, UserMakeTransfer, UserMakeWithdrawal, UserFinaliseWithdrawal, UserCheckBalances, UserExportCommitments, UserImportCommitments } from "./types";
import { Client } from "../client";
import { Web3Websocket } from "../ethereum";
import type { NightfallZkpKeys } from "../nightfall/types";
import { OffChainTransactionReceipt, OnChainTransactionReceipts } from "../transactions/types";
import type { TransactionReceipt } from "web3-core";
declare class UserFactory {
    static create(options: UserFactoryCreate): Promise<User>;
}
declare class User {
    client: Client;
    web3Websocket: Web3Websocket;
    shieldContractAddress: string;
    ethPrivateKey: string;
    ethAddress: string;
    nightfallMnemonic: string;
    zkpKeys: NightfallZkpKeys;
    nightfallDepositTxHashes: string[];
    nightfallTransferTxHashes: string[];
    nightfallWithdrawalTxHashes: string[];
    constructor(options: UserConstructor);
    /**
     * Allow user to check client API availability and blockchain ws connection
     *
     * @async
     * @deprecated checkStatus - Will be removed in upcoming versions
     */
    checkStatus(): Promise<void>;
    /**
     * Allow user to check client API availability
     *
     * @async
     * @method isClientAlive
     * @returns {Promise<boolean>}
     */
    isClientAlive(): Promise<boolean>;
    /**
     * Allow user to check blockchain ws connection
     *
     * @async
     * @method isWeb3WsAlive
     * @returns {Promise<boolean>}
     */
    isWeb3WsAlive(): Promise<boolean>;
    /**
     * Allow user to retrieve the Nightfall Mnemonic  - Keep this private
     *
     * @method getNightfallMnemonic
     * @returns {string} Nightfall mnemonic
     */
    getNightfallMnemonic(): string;
    /**
     * Allow user to retrieve Nightfall Layer2 address
     *
     * @method getNightfallAddress
     * @returns {string} Nightfall Layer2 address
     */
    getNightfallAddress(): string;
    /**
     * [Browser + MetaMask only] Update Ethereum account address
     *
     * @async
     * @method updateEthAccountFromMetamask
     * @returns {string} Ethereum account address
     */
    updateEthAccountFromMetamask(): Promise<any>;
    /**
     * Deposits a Layer 1 token into Layer 2, so that it can be transacted privately
     *
     * @async
     * @method makeDeposit
     * @param {UserMakeDeposit} options
     * @param {string} options.tokenContractAddress
     * @param {string} [options.tokenErcStandard] Will be deprecated
     * @param {string} [options.value]
     * @param {string} [options.tokenId]
     * @param {string} [options.feeWei]
     * @param {boolean} [options.isFeePaidInL2]
     * @returns {Promise<OnChainTransactionReceipts>}
     */
    makeDeposit(options: UserMakeDeposit): Promise<OnChainTransactionReceipts>;
    /**
     * Transfers a token within Layer 2
     *
     * @async
     * @method makeTransfer
     * @param {UserMakeTransfer} options
     * @param {string} options.tokenContractAddress
     * @param {string} [options.tokenErcStandard] Will be deprecated
     * @param {string} [options.value]
     * @param {string} [options.tokenId]
     * @param {string} [options.feeWei]
     * @param {string} options.recipientNightfallAddress
     * @param {Boolean} [options.isOffChain]
     * @returns {Promise<OnChainTransactionReceipts | OffChainTransactionReceipt>}
     */
    makeTransfer(options: UserMakeTransfer): Promise<OnChainTransactionReceipts | OffChainTransactionReceipt>;
    /**
     * Withdraws a token from Layer 2 back to Layer 1. It can then be withdrawn from the Shield contract's account by the owner in Layer 1.
     *
     * @async
     * @method makeWithdrawal
     * @param {UserMakeWithdrawal} options
     * @param {string} options.tokenContractAddress
     * @param {string} [options.tokenErcStandard] Will be deprecated
     * @param {string} [options.value]
     * @param {string} [options.tokenId]
     * @param {string} [options.feeWei]
     * @param {string} options.recipientEthAddress
     * @param {Boolean} [options.isOffChain]
     * @returns {Promise<OnChainTransactionReceipts | OffChainTransactionReceipt>}
     */
    makeWithdrawal(options: UserMakeWithdrawal): Promise<OnChainTransactionReceipts | OffChainTransactionReceipt>;
    /**
     * Allow user to finalise a previously initiated withdrawal and withdraw funds back to Layer1
     *
     * @async
     * @method finaliseWithdrawal
     * @param {UserFinaliseWithdrawal} options
     * @param {string} [options.withdrawTxHashL2] If not provided, will attempt to use latest withdrawal transaction hash
     * @returns {Promise<TransactionReceipt>}
     */
    finaliseWithdrawal(options?: UserFinaliseWithdrawal): Promise<TransactionReceipt>;
    /**
     * Allow user to check the deposits that haven't been processed yet
     *
     * @async
     * @method checkPendingDeposits
     * @param {UserCheckBalances} [options]
     * @param {string[]} [options.tokenContractAddresses] A list of token addresses
     * @returns {Promise<*>} Should resolve into an object containing the aggregated value per token, for deposit tx that have not been included yet in a Layer2 block
     */
    checkPendingDeposits(options?: UserCheckBalances): Promise<any>;
    /**
     * Allow user to get the total Nightfall Layer2 balance of its commitments
     *
     * @async
     * @method checkNightfallBalances
     * @returns {Promise<*>} Should resolve into an object containing the aggregated value per token, for commitments available in Layer2
     */
    checkNightfallBalances(): Promise<any>;
    /**
     * Allow user to check the balance of the pending spent commitments on Layer2
     *
     * @async
     * @method checkPendingTransfers
     * @returns {Promise<*>}
     */
    checkPendingTransfers(): Promise<any>;
    /**
     * Allow user to export commitments
     *
     * @async
     * @method exportCommitments
     * @param {UserExportCommitments} options
     * @param {String[]} options.listOfCompressedZkpPublicKey
     * @param {string} options.pathToExport
     * @param {string} options.fileName
     * @returns {Promise<void | null>}
     */
    exportCommitments(options: UserExportCommitments): Promise<void | null>;
    /**
     * Allow user to import commitments
     *
     * @async
     * @method importAndSaveCommitments
     * @param {UserImportCommitments} options
     * @param {string} options.compressedZkpPublicKey
     * @param {string} options.pathToImport
     * @param {string} options.fileName
     * @returns {Promise<string>}
     */
    importAndSaveCommitments(options: UserImportCommitments): Promise<any>;
    /**
     * Close user blockchain ws connection
     */
    close(): void;
}
export default UserFactory;
