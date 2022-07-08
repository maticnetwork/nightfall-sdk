import { generateMnemonic, validateMnemonic } from "bip39";

/**
 * Create a mnemonic using bip39 generateMnemonic
 *
 * @function createMnemonic
 * @returns {string} mnemonic
 */
export function createMnemonic(): string {
  return generateMnemonic();
}

/**
 * Validate a mnemonic using bip39 validateMnemonic
 *
 * @function createMnemonic
 * @throws {Error} Argument is not valid bip39 mnemonic
 */
export function validateNfMnemonic(mnemonic: string): void {
  const isMnemonic = validateMnemonic(mnemonic);
  if (!isMnemonic) throw new Error("Invalid mnemonic");
}
