"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createZkpKeysAndSubscribeToIncomingKeys = exports.validateOrCreateNfMnemonic = void 0;
const path_1 = __importDefault(require("path"));
const utils_1 = require("../utils");
const helpers_1 = require("./helpers");
const error_1 = require("../utils/error");
const logger = utils_1.parentLogger.child({
    name: path_1.default.relative(process.cwd(), __filename),
});
/**
 * Validate given mnemonic or create a mnemonic
 *
 * @function validateOrCreateNfMnemonic
 * @param {string} mnemonic
 * @throws {NightfallSdkError} Given mnemonic is not bip39
 * @returns {string} mnemonic <string> if the mnemonic is new or given one is valid
 */
function validateOrCreateNfMnemonic(mnemonic) {
    logger.debug("validateOrCreateNfMnemonic");
    if (!mnemonic) {
        mnemonic = (0, helpers_1.createMnemonic)();
        logger.debug("New mnemonic created successfully");
    }
    else {
        try {
            (0, helpers_1.validateNfMnemonic)(mnemonic);
        }
        catch (err) {
            logger.child({ mnemonic }).error(err, "Error while validating mnemonic");
            throw new error_1.NightfallSdkError(err);
        }
        logger.debug("Valid mnemonic");
    }
    return mnemonic;
}
exports.validateOrCreateNfMnemonic = validateOrCreateNfMnemonic;
/**
 * Create a set of Zero-knowledge proof keys from given/new mnemonic, then subscribe to incoming viewing keys
 *
 * @function createZkpKeysAndSubscribeToIncomingKeys
 * @param {string} mnemonic
 * @param {Client} client an instance of Client to interact with the API
 * @throws {NightfallSdkError} Something went wrong - CHECK
 * @returns {NightfallKeys} NightfallKeys if the mnemonic is new or given one is valid
 */
async function createZkpKeysAndSubscribeToIncomingKeys(mnemonic, client) {
    logger.debug("createZkpKeysAndSubscribeToIncomingKeys");
    const nightfallMnemonic = validateOrCreateNfMnemonic(mnemonic);
    logger.debug("Generate ZKP keys from mnemonic");
    const mnemonicAddressIdx = 0;
    const zkpKeys = await client.generateZkpKeysFromMnemonic(nightfallMnemonic, mnemonicAddressIdx);
    logger.debug("Subscribe to incoming viewing keys");
    await client.subscribeToIncomingViewingKeys(zkpKeys);
    return {
        nightfallMnemonic,
        zkpKeys,
    };
}
exports.createZkpKeysAndSubscribeToIncomingKeys = createZkpKeysAndSubscribeToIncomingKeys;
//# sourceMappingURL=keys.js.map