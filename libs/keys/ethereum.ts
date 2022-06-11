import Web3 from "web3";
import path from "path";
import { parentLogger } from "../utils";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

// DOCS privateKeyToAccount can also throw errors, use within try/catch
function validateEthPrivateKey(ethereumPrivateKey: string, web3: Web3): string {
  logger.debug("validateEthPrivateKey");

  const isKeyHexStrict = web3.utils.isHexStrict(ethereumPrivateKey);
  if (!isKeyHexStrict)
    throw new Error("Invalid eth private key, string is not HEX string");
  logger.info("Eth private key is hex strict");

  const ethAccount = web3.eth.accounts.privateKeyToAccount(ethereumPrivateKey);

  return ethAccount.address;
}

export function getEthAddressFromPrivateKey(
  ethereumPrivateKey: string,
  web3: Web3,
): null | string {
  logger.debug("getEthAddressFromPrivateKey");
  let ethAddress;
  try {
    ethAddress = validateEthPrivateKey(ethereumPrivateKey, web3);
  } catch (err) {
    logger
      .child({ ethereumPrivateKey })
      .error(err, "Error while validating eth private key");
    return null;
  }
  logger.info({ ethAddress }, "Eth address is");

  return ethAddress;
}
