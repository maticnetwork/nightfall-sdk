import path from "path";
import { parentLogger } from "../utils";
import { createMnemonic, validateNfMnemonic } from "./helpers";
import type { Client } from "../client";
import type { NightfallKeys } from "./types";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

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

export async function createZkpKeysFromMnemonic(
  mnemonic: undefined | string,
  client: Client,
): Promise<null | NightfallKeys> {
  logger.debug("createZkpKeysFromMnemonic");

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
