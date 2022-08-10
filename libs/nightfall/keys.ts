import path from "path";
import { parentLogger } from "../utils";
import { createMnemonic, validateNfMnemonic } from "./helpers";
import type { Client } from "../client";
import type { NightfallKeys } from "./types";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

/**
 * Validate given mnemonic or create a mnemonic
 *
 * @function validateOrCreateNfMnemonic
 * @param {string} mnemonic
 * @returns {null|string} mnemonic <string> if the mnemonic is new or given one is valid, else return null
 */
export function validateOrCreateNfMnemonic(
  mnemonic: undefined | string,
): null | string {
  logger.debug("validateOrCreateNfMnemonic");
  if (!mnemonic) {
    mnemonic = createMnemonic();
    logger.info("New mnemonic created successfully");
  } else {
    try {
      validateNfMnemonic(mnemonic);
    } catch (err) {
      logger.child({ mnemonic }).error(err, "Error while validating mnemonic");
      return null;
    }
    logger.info("Valid mnemonic");
  }
  return mnemonic;
}

/**
 * Create a set of Zero-knowledge proof keys from given/new mnemonic, then subscribe to incoming viewing keys
 *
 * @function createZkpKeysAndSubscribeToIncomingKeys
 * @param {string} mnemonic
 * @param {Client} client an instance of Client to interact with the API
 * @returns {null|NightfallKeys} NightfallKeys if the mnemonic is new or given one is valid, else return null
 */
export async function createZkpKeysAndSubscribeToIncomingKeys(
  mnemonic: undefined | string,
  client: Client,
): Promise<null | NightfallKeys> {
  logger.debug("createZkpKeysAndSubscribeToIncomingKeys");

  const nightfallMnemonic = validateOrCreateNfMnemonic(mnemonic);
  if (nightfallMnemonic === null) return null;

  logger.info("Generate ZKP keys from mnemonic");
  const mnemonicAddressIdx = 0;
  const zkpKeys = await client.generateZkpKeysFromMnemonic(
    nightfallMnemonic,
    mnemonicAddressIdx,
  );
  if (zkpKeys === null) return null;

  logger.info("Subscribe to incoming viewing keys");
  await client.subscribeToIncomingViewingKeys(zkpKeys);

  return {
    nightfallMnemonic,
    zkpKeys,
  };
}
