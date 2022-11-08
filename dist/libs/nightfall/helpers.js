"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateNfMnemonic = exports.createMnemonic = void 0;
const bip39_1 = require("bip39");
/**
 * Create a mnemonic using bip39 generateMnemonic
 *
 * @function createMnemonic
 * @returns {string} mnemonic
 */
function createMnemonic() {
    return (0, bip39_1.generateMnemonic)();
}
exports.createMnemonic = createMnemonic;
/**
 * Validate a mnemonic using bip39 validateMnemonic
 *
 * @function validateNfMnemonic
 * @param {string} mnemonic
 * @throws {Error} Argument is not valid bip39 mnemonic
 */
function validateNfMnemonic(mnemonic) {
    const isMnemonic = (0, bip39_1.validateMnemonic)(mnemonic);
    if (!isMnemonic)
        throw new Error("Invalid mnemonic");
}
exports.validateNfMnemonic = validateNfMnemonic;
//# sourceMappingURL=helpers.js.map