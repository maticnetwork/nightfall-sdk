import { generateMnemonic, validateMnemonic } from "bip39";

export function createMnemonic(): string {
  return generateMnemonic(); // Uses bip39
}

// DOCS can throw errors, use within try/catch
export function validateNfMnemonic(mnemonic: string): void {
  const isMnemonic = validateMnemonic(mnemonic); // Uses bip39
  if (!isMnemonic) throw new Error("Invalid mnemonic");
}
