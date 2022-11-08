"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("../utils");
const error_1 = require("../utils/error");
const logger = utils_1.parentLogger.child({
    name: path_1.default.relative(process.cwd(), __filename),
});
axios_1.default.interceptors.response.use((response) => response, (error) => {
    logger.error(error, "Client failed");
    throw new error_1.NightfallSdkError(error);
});
/**
 * Creates a new Client
 *
 * @class Client
 */
class Client {
    /**
     * Client constructor
     *
     * @param  {string} apiUrl client address
     */
    constructor(apiUrl) {
        logger.debug({ apiUrl }, "new Client at");
        this.apiUrl = apiUrl;
    }
    /**
     * Make GET request to check that API is alive
     *
     * @method healthCheck
     * @throws {NightfallSdkError} Response other than 200 or bad response
     * @returns {Promise<boolean>} Should resolve `true` if API is alive, else `false`
     */
    async healthCheck() {
        const endpoint = "healthcheck";
        logger.debug({ endpoint }, "Calling client at");
        const res = await axios_1.default.get(`${this.apiUrl}/${endpoint}`);
        if (res.status !== 200) {
            logger.error(res, "Client not available");
            throw new error_1.NightfallSdkError("Sorry, client not available");
        }
        logger.info({ status: res.status, data: res.data }, `Client at ${endpoint} responded`);
        return true;
    }
    /**
     * Make GET request to get the address for a given contract name
     *
     * @async
     * @method getContractAddress
     * @param {string} contractName The name of the contract for which we need the address
     * @throws {NightfallSdkError} Bad response
     * @returns {Promise<string>} Should resolve into Eth contract address
     */
    async getContractAddress(contractName) {
        const endpoint = `contract-address/${contractName}`;
        logger.debug({ endpoint }, "Calling client at");
        const res = await axios_1.default.get(`${this.apiUrl}/${endpoint}`);
        logger.info({ status: res.status, data: res.data }, `Client at ${endpoint} responded`);
        return res.data.address;
    }
    /**
     * Make POST request to get a set of Zero-knowledge proof keys
     *
     * @method generateZkpKeysFromMnemonic
     * @param {string} validMnemonic A valid bip39 mnemonic
     * @param {number} addressIndex Pass `0` to generate the first account
     * @throws {NightfallSdkError} Bad response
     * @returns {Promise<NightfallZkpKeys>} Should resolve into a set of keys if request is successful
     */
    async generateZkpKeysFromMnemonic(validMnemonic, addressIndex) {
        const endpoint = "generate-zkp-keys";
        logger.debug({ endpoint }, "Calling client at");
        const res = await axios_1.default.post(`${this.apiUrl}/${endpoint}`, {
            mnemonic: validMnemonic,
            addressIndex,
        });
        // Do NOT log res.data for privacy
        logger.info({ status: res.status }, `Client at ${endpoint} responded`);
        return res.data;
    }
    /**
     * Make POST request to subscribe to incoming viewing keys
     *
     * @method subscribeToIncomingViewingKeys
     * @param {NightfallZkpKeys} zkpKeys A set of Zero-knowledge proof keys
     * @throws {NightfallSdkError} Bad response
     * @returns {Promise<string>} Should resolve `string` (success) if request is successful
     */
    async subscribeToIncomingViewingKeys(zkpKeys) {
        const endpoint = "incoming-viewing-key";
        logger.debug({ endpoint }, "Calling client at");
        const res = await axios_1.default.post(`${this.apiUrl}/${endpoint}`, {
            zkpPrivateKeys: [zkpKeys.zkpPrivateKey],
            nullifierKeys: [zkpKeys.nullifierKey],
        });
        logger.info({ status: res.status, data: res.data }, `Client at ${endpoint} responded`);
        return res.data;
    }
    /**
     * Make POST request to create a deposit transaction (tx)
     *
     * @async
     * @method deposit
     * @param {*} token An instance of Token holding token data such as contract address
     * @param {NightfallZkpKeys} ownerZkpKeys Sender's set of Zero-knowledge proof keys
     * @param {string} value The amount in Wei of the token to be deposited
     * @param {string} tokenId The tokenId of the token to be deposited
     * @param {string} fee The amount in Wei to pay a proposer for the tx
     * @throws {NightfallSdkError} Bad response
     * @returns {Promise<TransactionResponseData>}
     */
    async deposit(token, ownerZkpKeys, value, tokenId, fee) {
        const endpoint = "deposit";
        logger.debug({ endpoint }, "Calling client at");
        const res = await axios_1.default.post(`${this.apiUrl}/${endpoint}`, {
            ercAddress: token.contractAddress,
            tokenType: token.ercStandard,
            value,
            tokenId,
            compressedZkpPublicKey: ownerZkpKeys.compressedZkpPublicKey,
            nullifierKey: ownerZkpKeys.nullifierKey,
            fee,
        });
        logger.info({ status: res.status, data: res.data }, `Client at ${endpoint} responded`);
        return res.data;
    }
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
    async transfer(token, ownerZkpKeys, recipientNightfallData, tokenId, fee, isOffChain) {
        const endpoint = "transfer";
        logger.debug({ endpoint }, "Calling client at");
        const res = await axios_1.default.post(`${this.apiUrl}/${endpoint}`, {
            offchain: isOffChain,
            ercAddress: token.contractAddress,
            tokenId,
            rootKey: ownerZkpKeys.rootKey,
            recipientData: recipientNightfallData,
            fee,
        });
        if (res.data.error && res.data.error === "No suitable commitments") {
            logger.error(res, "No suitable commitments were found");
            throw new error_1.NightfallSdkError("No suitable commitments were found");
        }
        logger.info({ status: res.status, data: res.data }, `Client at ${endpoint} responded`);
        return res.data;
    }
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
    async withdraw(token, ownerZkpKeys, value, tokenId, fee, recipientEthAddress, isOffChain) {
        const endpoint = "withdraw";
        logger.debug({ endpoint }, "Calling client at");
        const res = await axios_1.default.post(`${this.apiUrl}/${endpoint}`, {
            ercAddress: token.contractAddress,
            tokenType: token.ercStandard,
            rootKey: ownerZkpKeys.rootKey,
            recipientAddress: recipientEthAddress,
            value,
            tokenId,
            fee,
            offchain: isOffChain,
        });
        logger.info({ status: res.status, data: res.data }, `Client at ${endpoint} responded`);
        return res.data;
    }
    /**
     * Make POST request to finalise a previously initiated withdrawal (tx)
     *
     * @async
     * @method finaliseWithdrawal
     * @param {string} withdrawTxHashL2 Tx hash in Layer2 of the previously initiated withdrawal
     * @throws {NightfallSdkError} Bad response
     * @returns {Promise<TransactionResponseData>}
     */
    async finaliseWithdrawal(withdrawTxHashL2) {
        const endpoint = "finalise-withdrawal";
        logger.debug({ endpoint }, "Calling client at");
        const res = await axios_1.default.post(`${this.apiUrl}/${endpoint}`, {
            transactionHash: withdrawTxHashL2,
        });
        logger.info({ status: res.status, data: res.data }, `Client at ${endpoint} responded`);
        return res.data;
    }
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
    async getPendingDeposits(zkpKeys, tokenContractAddresses) {
        var _a;
        const endpoint = "commitment/pending-deposit";
        logger.debug({ endpoint }, "Calling client at");
        const res = await axios_1.default.get(`${this.apiUrl}/commitment/pending-deposit`, {
            params: {
                compressedZkpPublicKey: zkpKeys.compressedZkpPublicKey,
                ercList: tokenContractAddresses,
            },
        });
        logger.info({ status: res.status, data: res.data }, `Client at ${endpoint} responded`);
        return (_a = res.data.balance) === null || _a === void 0 ? void 0 : _a[zkpKeys.compressedZkpPublicKey];
    }
    async getNightfallBalances(zkpKeys) {
        const endpoint = "commitment/balance";
        logger.debug({ endpoint }, "Calling client at");
        const res = await axios_1.default.get(`${this.apiUrl}/${endpoint}`, {
            params: {
                compressedZkpPublicKey: zkpKeys.compressedZkpPublicKey,
            },
        });
        logger.info({ status: res.status, data: res.data }, `Client at ${endpoint} responded`);
        return res.data.balance;
    }
    async getPendingTransfers(zkpKeys) {
        var _a;
        const endpoint = "commitment/pending-spent";
        logger.debug({ endpoint }, "Calling client at");
        const res = await axios_1.default.get(`${this.apiUrl}/${endpoint}`, {
            params: {
                compressedZkpPublicKey: zkpKeys.compressedZkpPublicKey,
            },
        });
        logger.info({ status: res.status, data: res.data }, `Client at ${endpoint} responded`);
        return (_a = res.data.balance) === null || _a === void 0 ? void 0 : _a[zkpKeys.compressedZkpPublicKey];
    }
    /**
     * Make POST request to get all commitments filtered by many Nightfall addresses
     *
     * @method getCommitmentsByCompressedZkpPublicKey
     * @param {string[]} listOfCompressedZkpPublicKey list of compressedZkpPublicKeys (Nightfall address)
     * @throws {NightfallSdkError} No compressedZkpPublicKey given or bad response
     * @returns {Promise<Commitment[]>} Should resolve into a list of all existing commitments if request is successful
     */
    async getCommitmentsByCompressedZkpPublicKey(listOfCompressedZkpPublicKey) {
        const endpoint = "commitment/compressedZkpPublicKeys";
        logger.debug({ endpoint }, "Calling client at");
        if (!listOfCompressedZkpPublicKey.length) {
            logger.error(listOfCompressedZkpPublicKey, "You should pass at least one compressedZkpPublicKey");
            throw new error_1.NightfallSdkError("You should pass at least one compressedZkpPublicKey");
        }
        const res = await axios_1.default.post(`${this.apiUrl}/${endpoint}`, listOfCompressedZkpPublicKey);
        logger.info({ status: res.status, data: res.data }, `Client at ${endpoint} responded`);
        return res.data.commitmentsByListOfCompressedZkpPublicKey;
    }
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
    async saveCommitments(listOfCommitments) {
        const endpoint = "commitment/save";
        logger.debug({ endpoint }, "Calling client at");
        const res = await axios_1.default.post(`${this.apiUrl}/${endpoint}`, listOfCommitments);
        logger.info({ status: res.status, data: res.data }, `Client at ${endpoint} responded`);
        return res.data;
    }
}
exports.default = Client;
//# sourceMappingURL=client.js.map