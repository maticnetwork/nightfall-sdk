"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitTransaction = void 0;
const path_1 = __importDefault(require("path"));
const utils_1 = require("../../utils");
const logger = utils_1.parentLogger.child({
    name: path_1.default.relative(process.cwd(), __filename),
});
const GAS = process.env.GAS || 4000000;
const GAS_PRICE = process.env.GAS_PRICE || 10000000000;
// const GAS_ESTIMATE_ENDPOINT =
//   process.env.GAS_ESTIMATE_ENDPOINT ||
//   "https://vqxy02tr5e.execute-api.us-east-2.amazonaws.com/production/estimateGas";
const GAS_MULTIPLIER = Number(process.env.GAS_MULTIPLIER) || 2;
const GAS_PRICE_MULTIPLIER = Number(process.env.GAS_PRICE_MULTIPLIER) || 2;
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
async function submitTransaction(senderEthAddress, senderEthPrivateKey, recipientEthAddress, unsignedTx, web3, fee = "0") {
    logger.debug({ senderEthAddress, recipientEthAddress, unsignedTx, fee }, "submitTransaction");
    // Estimate gas
    const gas = Math.ceil(Number(GAS) * GAS_MULTIPLIER); // ISSUE #28
    const gasPrice = Math.ceil(Number(GAS_PRICE) * GAS_PRICE_MULTIPLIER); // ISSUE #28
    logger.debug(`Transaction gasPrice was set at ${Math.ceil(gasPrice / 10 ** 9)} GWei, gas limit was set at ${gas}`);
    const tx = {
        from: senderEthAddress,
        to: recipientEthAddress,
        data: unsignedTx,
        value: fee,
        gas,
        gasPrice,
    };
    if (!senderEthPrivateKey) {
        logger.debug({ tx }, "Send tx via MetaMask...");
        return web3.eth.sendTransaction(tx);
    }
    logger.debug({ tx }, "Sign tx...");
    const signedTx = await web3.eth.accounts.signTransaction(tx, senderEthPrivateKey);
    logger.debug({ signedTx }, "Send signedTx...");
    return web3.eth.sendSignedTransaction(signedTx.rawTransaction);
}
exports.submitTransaction = submitTransaction;
//# sourceMappingURL=submit.js.map