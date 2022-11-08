import type { Client } from "../client";
import type { NightfallKeys } from "./types";
/**
 * Validate given mnemonic or create a mnemonic
 *
 * @function validateOrCreateNfMnemonic
 * @param {string} mnemonic
 * @throws {NightfallSdkError} Given mnemonic is not bip39
 * @returns {string} mnemonic <string> if the mnemonic is new or given one is valid
 */
export declare function validateOrCreateNfMnemonic(mnemonic: undefined | string): string;
/**
 * Create a set of Zero-knowledge proof keys from given/new mnemonic, then subscribe to incoming viewing keys
 *
 * @function createZkpKeysAndSubscribeToIncomingKeys
 * @param {string} mnemonic
 * @param {Client} client an instance of Client to interact with the API
 * @throws {NightfallSdkError} Something went wrong - CHECK
 * @returns {NightfallKeys} NightfallKeys if the mnemonic is new or given one is valid
 */
export declare function createZkpKeysAndSubscribeToIncomingKeys(mnemonic: undefined | string, client: Client): Promise<NightfallKeys>;
