import type Web3 from "web3";
import path from "path";
import { parentLogger } from "../utils";
import { NightfallSdkError } from "../utils/error";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

/**
 * Generate an ethereum address from a given private key
 *
 * @function getEthAccountAddress
 * @param {string} ethereumPrivateKey
 * @param {Web3} web3
 * @throws {NightfallSdkError} Error while validating eth private key
 * @returns {string} Eth account address
 */
export function getEthAccountAddress(ethereumPrivateKey: string, web3: Web3): string {
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
    throw new NightfallSdkError(err);
  }
  const address = ethAccount.address;
  logger.info({ address }, "Eth account address is");

  return address;
}
