import type Web3 from "web3";
import { TX_GAS_MULTIPLIER, TX_GAS_PRICE_MULTIPLIER } from "./constants";
import { logger, NightfallSdkError } from "../utils";
import type { TransactionConfig } from "web3-core";

/**
 * Estimate the amount of gas that will be needed to submit a transaction (tx)
 *
 * The underlying RPC `eth_estimateGas` will check the balance of the sender,
 * this means that even though the call doesn't consume any gas,
 * the `from` address must have enough gas to execute the tx
 *
 * @async
 * @function estimateGas
 * @param {TransactionConfig} tx A tx object
 * @param {Web3} web3
 * @throws {NightfallSdkError} Web3 errors
 * @returns {Promise<number>}
 */
export async function estimateGas(
  tx: TransactionConfig,
  web3: Web3,
): Promise<number> {
  logger.debug({ tx }, "estimateGas");

  let gas;
  try {
    gas = await web3.eth.estimateGas(tx);
    logger.debug(`Gas estimated at ${gas}`);
  } catch (error) {
    logger.error(error, "Gas estimation failed");
    throw new NightfallSdkError(error);
  }
  return Math.ceil(gas * TX_GAS_MULTIPLIER);
}

/**
 * Estimate gas price
 *
 * @async
 * @function estimateGasPrice
 * @param {Web3} web3
 * @throws {NightfallSdkError} Web3 errors
 * @returns {Promise<number>}
 */
export async function estimateGasPrice(web3: Web3): Promise<number> {
  logger.debug("estimateGasPrice");

  let gasPrice;
  try {
    gasPrice = Number(await web3.eth.getGasPrice());
    logger.debug(`Gas price is ${gasPrice}`);
  } catch (err) {
    logger.error(err, "Something went wrong while getting gas price");
    throw new NightfallSdkError(err);
  }
  return Math.ceil(gasPrice * TX_GAS_PRICE_MULTIPLIER);
}
