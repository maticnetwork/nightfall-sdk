import type Web3 from "web3";
import path from "path";
import { parentLogger } from "../utils";
import type { TransactionConfig } from "web3-core";
import { TX_GAS_DEFAULT, TX_GAS_MULTIPLIER } from "./constants";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

/**
 * Estimate the amount of gas that will be needed to submit a tx
 * It doesn't consume gas, but the underlying RPC call `eth_estimateGas` will check the balance of the sender,
 * so `from` address must have enough gas
 *
 * @async
 * @function estimateGas
 * @param {TransactionConfig} tx A transaction object
 * @param {Web3} web3
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
    gas = TX_GAS_DEFAULT;
    logger.warn(`Gas estimation failed, default to ${gas}`);
  }

  return Math.ceil(gas * TX_GAS_MULTIPLIER); // 50% seems a more than reasonable buffer
}
