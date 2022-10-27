"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const utils_1 = require("../utils");
const error_1 = require("../utils/error");
const logger = utils_1.parentLogger.child({
    name: path_1.default.relative(process.cwd(), __filename),
});
/**
 * Verify if all commitments in the list belong to the user compressed zkp public key
 *
 * @async
 * @function commitmentsFromMnemonic
 * @param {Commitment[]} listOfCommitments a list of commitments to be verified.
 * @param {string} compressedZkpPublicKey the compressed key derived from the mnemonic
 * @throws {NightfallSdkError} if one of the commitments doesn't match with the user compressedZkpPublicKey
 * @returns {boolean} `true` when all commitments belong to given compressedZkpPublicKey
 */
function commitmentsFromMnemonic(listOfCommitments, compressedZkpPublicKey) {
    logger.debug("commitmentsFromMnemonic");
    for (const commitment of listOfCommitments) {
        if (commitment.compressedZkpPublicKey !== compressedZkpPublicKey) {
            logger.error("At least one of the commitments in this list does not match with the compressedZkpPublicKey!");
            throw new error_1.NightfallSdkError("At least one of the commitments in this list does not match with the compressedZkpPublicKey!");
        }
    }
    return true;
}
exports.default = commitmentsFromMnemonic;
//# sourceMappingURL=commitmentsFromMnemonic.js.map