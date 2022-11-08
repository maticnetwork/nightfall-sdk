/**
 * Create a mnemonic using bip39 generateMnemonic
 *
 * @function createMnemonic
 * @returns {string} mnemonic
 */
export declare function createMnemonic(): string;
/**
 * Validate a mnemonic using bip39 validateMnemonic
 *
 * @function validateNfMnemonic
 * @param {string} mnemonic
 * @throws {Error} Argument is not valid bip39 mnemonic
 */
export declare function validateNfMnemonic(mnemonic: string): void;
