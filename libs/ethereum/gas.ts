import type Web3 from "web3";
import path from "path";
import { parentLogger } from "../utils";
import type { TransactionConfig } from "web3-core";
import { TX_GAS_DEFAULT, TX_GAS_MULTIPLIER } from "./constants";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

// DOCS: eth_estimateGas will check the balance of the sender (to make sure that the sender has enough gas to complete the request).
// This means that even though the call doesn't consume any gas, the from address must have enough gas to execute the transaction.
export async function estimateGas(
  tx: TransactionConfig,
  web3: Web3,
): Promise<number> {
  logger.debug({ fee: tx.value }, "estimateGas");

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
