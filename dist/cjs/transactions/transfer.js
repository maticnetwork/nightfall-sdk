"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndSubmitTransfer = void 0;
const path_1 = __importDefault(require("path"));
const utils_1 = require("../utils");
const submit_1 = require("./helpers/submit");
const error_1 = require("../utils/error");
const logger = utils_1.parentLogger.child({
    name: path_1.default.relative(process.cwd(), __filename),
});
/**
 * Handle the flow for transfer transaction (tx)
 *
 * @async
 * @function createAndSubmitTransfer
 * @param {*} token An instance of Token holding token data such as contract address
 * @param {string} ownerEthAddress Eth address sending the contents of the transfer
 * @param {undefined | string} ownerEthPrivateKey Eth private key of the sender to sign the tx
 * @param {NightfallZkpKeys} ownerZkpKeys Sender's set of Zero-knowledge proof keys
 * @param {string} shieldContractAddress Address of the Shield smart contract
 * @param {Web3} web3 web3js instance
 * @param {Client} client An instance of Client to interact with the API
 * @param {string} value The amount in Wei of the token to be transferred
 * @param {string} tokenId The id of the ERC721 to be transferred
 * @param {string} fee The amount in Wei to pay a proposer for the tx
 * @param {string} recipientNightfallAddress Recipient zkpKeys.compressedZkpPublicKey
 * @param {boolean} isOffChain If true, tx will be sent to the proposer's API (handled off-chain)
 * @throws {NightfallSdkError} Error while broadcasting on-chain tx
 * @returns {Promise<OnChainTransactionReceipts | OffChainTransactionReceipt>}
 */
async function createAndSubmitTransfer(token, ownerEthAddress, ownerEthPrivateKey, ownerZkpKeys, shieldContractAddress, web3, client, value, tokenId, fee, recipientNightfallAddress, isOffChain) {
    logger.debug("createAndSubmitTransfer");
    const recipientNightfallData = {
        recipientCompressedZkpPublicKeys: [recipientNightfallAddress],
        values: [value],
    };
    const resData = await client.transfer(token, ownerZkpKeys, recipientNightfallData, tokenId, fee, isOffChain);
    const txReceiptL2 = resData.transaction;
    if (!isOffChain) {
        const unsignedTx = resData.txDataToSign;
        logger.debug({ unsignedTx }, "Transfer tx, unsigned");
        let txReceipt;
        try {
            txReceipt = await (0, submit_1.submitTransaction)(ownerEthAddress, ownerEthPrivateKey, shieldContractAddress, unsignedTx, web3);
        }
        catch (err) {
            logger.child({ resData }).error(err, "Error when submitting transaction");
            throw new error_1.NightfallSdkError(err);
        }
        return { txReceipt, txReceiptL2 };
    }
    return { txReceiptL2 };
}
exports.createAndSubmitTransfer = createAndSubmitTransfer;
//# sourceMappingURL=transfer.js.map