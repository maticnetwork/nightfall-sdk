"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndSubmitFinaliseWithdrawal = void 0;
const path_1 = __importDefault(require("path"));
const utils_1 = require("../utils");
const submit_1 = require("./helpers/submit");
const error_1 = require("../utils/error");
const logger = utils_1.parentLogger.child({
    name: path_1.default.relative(process.cwd(), __filename),
});
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
async function createAndSubmitFinaliseWithdrawal(ownerEthAddress, ownerEthPrivateKey, shieldContractAddress, web3, client, withdrawTxHashL2) {
    logger.debug("createAndSubmitFinaliseWithdrawal");
    const resData = await client.finaliseWithdrawal(withdrawTxHashL2);
    const unsignedTx = resData.txDataToSign;
    logger.debug({ unsignedTx }, "Finalise withdrawal tx, unsigned");
    let txReceipt;
    try {
        txReceipt = await (0, submit_1.submitTransaction)(ownerEthAddress, ownerEthPrivateKey, shieldContractAddress, unsignedTx, web3);
    }
    catch (err) {
        logger.child({ resData }).error(err, "Error when submitting transaction");
        throw new error_1.NightfallSdkError(err);
    }
    return txReceipt;
}
exports.createAndSubmitFinaliseWithdrawal = createAndSubmitFinaliseWithdrawal;
//# sourceMappingURL=withdrawalFinalise.js.map