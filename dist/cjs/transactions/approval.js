"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndSubmitApproval = void 0;
const path_1 = __importDefault(require("path"));
const utils_1 = require("../utils");
// import type { Token } from "../tokens";
const submit_1 = require("./helpers/submit");
const error_1 = require("../utils/error");
const logger = utils_1.parentLogger.child({
    name: path_1.default.relative(process.cwd(), __filename),
});
/**
 * Handle the flow for approval transaction (tx)
 * this is to update the spender allowance before a deposit tx
 *
 * @async
 * @function createAndSubmitApproval
 * @param {*} token An instance of Token holding token data such as contract address
 * @param {string} ownerEthAddress Eth address which may own some token balance
 * @param {undefined | string} ownerEthPrivateKey Eth private key of the sender to sign the tx
 * @param {string} spenderEthAddress Eth address of the Shield smart contract (spender)
 * @param {Web3} web3 web3js instance
 * @param {string} value The amount in Wei of the token to be deposited later
 * @throws {NightfallSdkError} Error while interacting with token contract or while broadcasting tx
 * @returns {Promise<null | TransactionReceipt>} Should resolve `null` if approval is not required, else Eth tx receipt
 */
async function createAndSubmitApproval(token, // Token,
ownerEthAddress, ownerEthPrivateKey, spenderEthAddress, web3, value) {
    logger.debug("createAndSubmitApproval");
    let txReceipt;
    try {
        // Check if transaction needs to be approved
        const isTxApproved = await token.isTransactionApproved(ownerEthAddress, spenderEthAddress, value);
        if (isTxApproved) {
            logger.info("Token allowance is already approved");
            return null;
        }
        // Approval is required
        logger.info("Approval required");
        if (ownerEthPrivateKey) {
            const unsignedTx = await token.approvalUnsignedTransaction(spenderEthAddress);
            logger.debug({ unsignedTx }, "Approval tx, unsigned");
            txReceipt = await (0, submit_1.submitTransaction)(ownerEthAddress, ownerEthPrivateKey, token.contractAddress, unsignedTx, web3);
        }
        else {
            txReceipt = await token.approve(ownerEthAddress, spenderEthAddress);
        }
    }
    catch (err) {
        logger.error(err, "Error while checking/processing approval tx");
        throw new error_1.NightfallSdkError(err);
    }
    return txReceipt;
}
exports.createAndSubmitApproval = createAndSubmitApproval;
//# sourceMappingURL=approval.js.map