"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndSubmitDeposit = void 0;
const path_1 = __importDefault(require("path"));
const utils_1 = require("../utils");
// import type { Token } from "../tokens";
const submit_1 = require("./helpers/submit");
const error_1 = require("../utils/error");
const logger = utils_1.parentLogger.child({
    name: path_1.default.relative(process.cwd(), __filename),
});
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
async function createAndSubmitDeposit(token, ownerEthAddress, ownerEthPrivateKey, ownerZkpKeys, shieldContractAddress, web3, client, value, tokenId, feeL1, feeL2) {
    logger.debug("createAndSubmitDeposit");
    const resData = await client.deposit(token, ownerZkpKeys, value, tokenId, feeL2);
    const txReceiptL2 = resData.transaction;
    const unsignedTx = resData.txDataToSign;
    logger.debug({ unsignedTx }, "Deposit tx, unsigned");
    let txReceipt;
    try {
        txReceipt = await (0, submit_1.submitTransaction)(ownerEthAddress, ownerEthPrivateKey, shieldContractAddress, unsignedTx, web3, feeL1);
    }
    catch (err) {
        logger.child({ resData }).error(err, "Error when submitting transaction");
        throw new error_1.NightfallSdkError(err);
    }
    return { txReceipt, txReceiptL2 };
}
exports.createAndSubmitDeposit = createAndSubmitDeposit;
//# sourceMappingURL=deposit.js.map