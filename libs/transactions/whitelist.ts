import type Web3 from "web3";
import path from "path";
import { parentLogger } from "../utils";
// import type { Token } from "../tokens";
import { submitTransaction } from "./helpers/submit";
import type { Client } from "../client";
import type { TransactionReceipt } from "web3-core";
import type {
   EthereumTransactionReceipts }
from "./types";
import { NightfallSdkError } from "../utils/error";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

/**
 * Handle the flow to add new address to whitelist
 *
 * @async
 * @function createAndSubmitAddAddressToWhitelist
 * @param {string} ownerEthAddress Eth address performing the request. It needs to be authorized to whitelist
 * @param {undefined | string} ownerEthPrivateKey Eth private key of the sender to sign the tx
 * @param {string} whitelistContractAddress Address of the Whitelist smart contract
 * @param {Web3} web3 web3js instance
 * @param {Client} client An instance of Client to interact with the API
 * @param {string} whitelistedEthAddress Ethereum address to be whitelisted
 * @throws {NightfallSdkError} Error while broadcasting tx
 * @returns {Promise<EthereumTransactionReceipts>}
 */
export async function createAndSubmitAddAddressToWhitelist(
  ownerEthAddress: string,
  ownerEthPrivateKey: undefined | string,
  whitelistContractAddress: string,
  web3: Web3,
  client: Client,
  whitelistedEthAddress: string,
): Promise<EthereumTransactionReceipts> {
  logger.debug("createAndSubmitAddAddressToWhitelist");

  const resData = await client.addAddressToWhitelist(
    whitelistedEthAddress,
  );
  const unsignedTx = resData.txDataToSign;
  logger.debug({ unsignedTx }, "Whitelist add address tx, unsigned");

  let txReceipt: TransactionReceipt;
  try {
    txReceipt = await submitTransaction(
      ownerEthAddress,
      ownerEthPrivateKey,
      whitelistContractAddress,
      unsignedTx,
      web3,
    );
  } catch (err) {
    logger.child({ resData }).error(err, "Error when submitting transaction");
    throw new NightfallSdkError(err);
  }

  return { txReceipt };
}

/**
 * Handle the flow to remove address from whitelist
 *
 * @async
 * @function createAndSubmitRemoveAddressFromWhitelist
 * @param {string} ownerEthAddress Eth address performing the request. It needs to be authorized to whitelist
 * @param {undefined | string} ownerEthPrivateKey Eth private key of the sender to sign the tx
 * @param {string} whitelistContractAddress Address of the Whitelist smart contract
 * @param {Web3} web3 web3js instance
 * @param {Client} client An instance of Client to interact with the API
 * @param {string} whitelistedEthAddress Ethereum address to be whitelisted
 * @throws {NightfallSdkError} Error while broadcasting tx
 * @returns {Promise<EthereumTransactionReceipts>}
 */
 export async function createAndSubmitRemoveAddressFromWhitelist(
  ownerEthAddress: string,
  ownerEthPrivateKey: undefined | string,
  whitelistContractAddress: string,
  web3: Web3,
  client: Client,
  whitelistedEthAddress: string,
): Promise<EthereumTransactionReceipts> {
  logger.debug("createAndSubmitRemoveAddressFromWhitelist");

  const resData = await client.removeAddressFromWhitelist(
    whitelistedEthAddress,
  );
  const unsignedTx = resData.txDataToSign;
  logger.debug({ unsignedTx }, "Whitelist remove address tx, unsigned");

  let txReceipt: TransactionReceipt;
  try {
    txReceipt = await submitTransaction(
      ownerEthAddress,
      ownerEthPrivateKey,
      whitelistContractAddress,
      unsignedTx,
      web3,
    );
  } catch (err) {
    logger.child({ resData }).error(err, "Error when submitting transaction");
    throw new NightfallSdkError(err);
  }

  return { txReceipt };
}
