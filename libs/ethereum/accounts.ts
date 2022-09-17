import type Web3 from "web3";
import path from "path";
import { parentLogger } from "../utils";
import { NightfallSdkError } from "../utils/error";
import type { Web3Websocket } from "./web3Websocket";
import { MetaMaskEthereumProvider } from "./types";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

/**
 * Recreate an Ethereum account from a given private key and return the address
 *
 * @function getEthAccountAddress
 * @param {string} ethereumPrivateKey
 * @param {Web3} web3
 * @throws {NightfallSdkError} Error while validating eth private key
 * @returns {string} Eth account address
 */
export function getEthAccountAddress(
  ethereumPrivateKey: string,
  web3: Web3,
): string {
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
  const ethAddress = ethAccount.address;
  logger.info({ ethAddress }, "Eth account address is");

  return ethAddress;
}

export async function getEthAccountFromMetaMask(ws: Web3Websocket) {
  logger.debug("getEthAccountFromMetaMask");
  let metaMaskAccounts;
  try {
    // https://docs.metamask.io/guide/ethereum-provider.html#errors
    metaMaskAccounts = await (ws.provider as MetaMaskEthereumProvider).request({
      method: "eth_requestAccounts",
    });
  } catch (err) {
    logger.error(err, "Error while calling eth_requestAccounts");
    throw new NightfallSdkError(err);
  }
  const ethAddress = metaMaskAccounts[0];
  logger.info({ ethAddress }, "Eth account address is");

  return ethAddress;
}
