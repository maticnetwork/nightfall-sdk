import type Web3 from "web3";
import path from "path";
import { parentLogger } from "../utils";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

/**
 * Generate an ethereum address from a given private key
 *
 * @function getEthAccountAddress
 * @param {string} ethereumPrivateKey
 * @param {Web3} web3
 * @returns {null|string} address <string> if the private key is valid, else return null
 */
export function getEthAccountAddress(
  ethereumPrivateKey: string,
  web3: Web3,
): null | string {
  logger.debug("getEthAccountAddress");
  let ethAccount;
  try {
    // privateKeyToAccount https://github.com/ChainSafe/web3.js/blob/555aa0d212e4738ba7a943bbdb34335518486950/packages/web3-eth-accounts/src/index.js#L133
    // appends "0x" if not present, validates length, but
    // we recommend to check both conditions beforehand
    ethAccount = web3.eth.accounts.privateKeyToAccount(ethereumPrivateKey);
  } catch (err) {
    logger
      .child({ ethereumPrivateKey })
      .error(err, "Error while validating eth private key");
    return null;
  }
  const address = ethAccount.address;
  logger.info({ address }, "Eth address is");

  return address;
}
