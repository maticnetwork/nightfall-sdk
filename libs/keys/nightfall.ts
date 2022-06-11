import { generateMnemonic, validateMnemonic } from "bip39";
import path from "path";
import { parentLogger } from "../utils";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

function createMnemonic(): string {
  logger.debug("createMnemonic");
  return generateMnemonic(); // FYI using bip39
}

// DOCS can throw errors, use within try/catch
function validateNfMnemonic(mnemonic: string): string {
  logger.debug("validateNfMnemonic");
  const isMnemonic = validateMnemonic(mnemonic); // FYI using bip39
  if (!isMnemonic) throw new Error("Invalid mnemonic");
  return mnemonic;
}

function validateOrCreateNfMnemonic(
  mnemonic: undefined | string,
): null | string {
  logger.debug("validateOrCreateNfMnemonic");
  let _mnemonic: null | string;
  if (!mnemonic) {
    _mnemonic = createMnemonic();
    logger.info("New mnemonic created successfully");
  } else {
    try {
      _mnemonic = validateNfMnemonic(mnemonic);
    } catch (err) {
      logger.child({ mnemonic }).error(err, "Error while validating mnemonic");
      return null;
    }
    logger.info("Valid mnemonic");
  }
  return _mnemonic;
}

// TODO improve client, return types
export async function createZkpKeysFromMnemonic(
  mnemonic: undefined | string,
  client: any,
): Promise<any> {
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
