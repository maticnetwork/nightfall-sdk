import axios from "axios";
import type Web3 from "web3";
import { logger } from "../utils";
import type { TransactionConfig } from "web3-core";
import {
  GAS,
  GAS_MULTIPLIER,
  GAS_PRICE_ESTIMATE_ENDPOINT,
  GAS_PRICE,
  GAS_PRICE_MULTIPLIER,
} from "./constants";

const gas = globalThis.process?.env.GAS
  ? Number(globalThis.process?.env.GAS)
  : GAS;
const gasMultiplier = globalThis.process?.env.GAS_MULTIPLIER
  ? Number(globalThis.process?.env.GAS_MULTIPLIER)
  : GAS_MULTIPLIER;

const gasEstimateEndpoint =
  globalThis.process?.env.GAS_PRICE_ESTIMATE_ENDPOINT ??
  GAS_PRICE_ESTIMATE_ENDPOINT;
const gasPrice = globalThis.process?.env.GAS_PRICE
  ? Number(globalThis.process?.env.GAS_PRICE)
  : GAS_PRICE;
const gasPriceMultiplier = globalThis.process?.env.GAS_PRICE_MULTIPLIER
  ? Number(globalThis.process?.env.GAS_PRICE_MULTIPLIER)
  : GAS_PRICE_MULTIPLIER;

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
 * @returns {Promise<number>}
 */
export async function estimateGas(
  tx: TransactionConfig,
  web3: Web3,
): Promise<number> {
  logger.debug({ tx }, "estimateGas");

  let proposedGas;
  try {
    proposedGas = await web3.eth.estimateGas(tx);
    logger.debug(`Gas estimated at ${proposedGas}`);
  } catch (error) {
    proposedGas = gas;
    logger.warn(`Gas estimation failed, default to ${proposedGas}`);
  }
  return Math.ceil(proposedGas * gasMultiplier);
}

/**
 * Estimate gas price
 *
 * First tries to get gas_price value from external endpoint,
 * if the request fails attempts to query the value via web3,
 * if web3 fails too uses default
 *
 * @async
 * @function estimateGasPrice
 * @param {Web3} web3
 * @returns {Promise<number>}
 */
export async function estimateGasPrice(web3: Web3): Promise<number> {
  logger.debug({ msg: "Estimate gas price..." });

  let proposedGasPrice;
  try {
    const { result } = (await axios.get(gasEstimateEndpoint)).data;
    proposedGasPrice = Number(result?.ProposeGasPrice) * 10 ** 9;
    logger.debug({ msg: "Gas price", proposedGasPrice });
  } catch (error) {
    try {
      proposedGasPrice = Number(await web3.eth.getGasPrice());
      logger.debug({
        msg: "Gas endpoint failed, web3 gas price",
        proposedGasPrice,
      });
    } catch (err) {
      proposedGasPrice = gasPrice;
      logger.debug({
        msg: "Gas price estimation failed, use default",
        proposedGasPrice,
      });
    }
  }
  return Math.ceil(proposedGasPrice * gasPriceMultiplier);
}
