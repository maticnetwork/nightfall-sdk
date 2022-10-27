"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEthAccountFromMetaMask = exports.getEthAccountAddress = void 0;
const path_1 = __importDefault(require("path"));
const utils_1 = require("../utils");
const error_1 = require("../utils/error");
const logger = utils_1.parentLogger.child({
    name: path_1.default.relative(process.cwd(), __filename),
});
/**
 * Recreate an Ethereum account from a given private key and return the address
 *
 * @function getEthAccountAddress
 * @param {string} ethereumPrivateKey
 * @param {Web3} web3
 * @throws {NightfallSdkError} Error while validating eth private key
 * @returns {string} Eth account address
 */
function getEthAccountAddress(ethereumPrivateKey, web3) {
    logger.debug("getEthAccountAddress");
    let ethAccount;
    try {
        // privateKeyToAccount https://github.com/ChainSafe/web3.js/blob/555aa0d212e4738ba7a943bbdb34335518486950/packages/web3-eth-accounts/src/index.js#L133
        // appends "0x" if not present, validates length, but
        // we recommend to check both conditions beforehand
        ethAccount = web3.eth.accounts.privateKeyToAccount(ethereumPrivateKey);
    }
    catch (err) {
        logger
            .child({ ethereumPrivateKey })
            .error(err, "Error while validating eth private key");
        throw new error_1.NightfallSdkError(err);
    }
    const ethAddress = ethAccount.address;
    logger.info({ ethAddress }, "Eth account address is");
    return ethAddress;
}
exports.getEthAccountAddress = getEthAccountAddress;
async function getEthAccountFromMetaMask(ws) {
    logger.debug("getEthAccountFromMetaMask");
    let metaMaskAccounts;
    try {
        // https://docs.metamask.io/guide/ethereum-provider.html#errors
        metaMaskAccounts = await ws.provider.request({
            method: "eth_requestAccounts",
        });
    }
    catch (err) {
        logger.error(err, "Error while calling eth_requestAccounts");
        throw new error_1.NightfallSdkError(err);
    }
    const ethAddress = metaMaskAccounts[0];
    logger.info({ ethAddress }, "Eth account address is");
    return ethAddress;
}
exports.getEthAccountFromMetaMask = getEthAccountFromMetaMask;
//# sourceMappingURL=accounts.js.map