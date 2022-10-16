import type Web3 from "web3";
import path from "path";
import { parentLogger } from "../../utils";
import type { TransactionConfig, TransactionReceipt } from "web3-core";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

const GAS = 4000000;
const GAS_MULTIPLIER = 2;

// DOCS: eth_estimateGas will check the balance of the sender (to make sure that the sender has enough gas to complete the request).
// This means that even though the call doesn't consume any gas, the from address must have enough gas to execute the transaction.
async function estimateGas(tx: TransactionConfig, web3: Web3): Promise<number> {
  logger.debug({ fee: tx.value }, "estimateGas");

  let gas;
  try {
    gas = await web3.eth.estimateGas(tx);
    logger.debug(`Gas estimated at ${gas}`);
  } catch (error) {
    gas = GAS;
    logger.warn(`Gas estimation failed, default to ${GAS}`);
  }

  return Math.ceil(gas * GAS_MULTIPLIER); // 50% seems a more than reasonable buffer.
}

/**
 * Create, sign and broadcast an Ethereum transaction (tx) to the network
 *
 * @async
 * @function submitTransaction
 * @param {string} senderEthAddress Eth address sending the contents of the tx
 * @param {undefined | string} senderEthPrivateKey Eth private key of the sender to sign the tx
 * @param {string} recipientEthAddress Eth address receiving the contents of the tx
 * @param {string} unsignedTx The contents of the tx (sent in data)
 * @param {Web3} web3 web3js instance
 * @param {string} fee The amount in Wei to pay a proposer for the tx
 * @returns {Promise<TransactionReceipt>}
 */
export async function submitTransaction(
  senderEthAddress: string,
  senderEthPrivateKey: undefined | string,
  recipientEthAddress: string,
  unsignedTx: string,
  web3: Web3,
  fee = "0",
): Promise<TransactionReceipt> {
  logger.debug(
    { senderEthAddress, recipientEthAddress, unsignedTx, fee },
    "submitTransaction",
  );
  // Ethereum tx
  const tx: TransactionConfig = {
    from: senderEthAddress,
    to: recipientEthAddress,
    value: fee,
    data: unsignedTx,
  };

  // Estimate tx gas
  const gas = await estimateGas(tx, web3);
  logger.debug(`Transaction gas set at ${gas}`);
  tx.gas = gas;

  // If no private key is given, SDK tries to submit tx via MetaMask
  if (!senderEthPrivateKey) {
    logger.debug({ tx }, "Send tx via MetaMask...");
    return web3.eth.sendTransaction(tx);
  }

  // Otherwise, sign tx then submit it
  logger.debug({ fee: tx.value }, "Sign tx...");
  const signedTx = await web3.eth.accounts.signTransaction(
    tx,
    senderEthPrivateKey,
  );

  logger.debug({ signedTx }, "Send signedTx...");
  return web3.eth.sendSignedTransaction(signedTx.rawTransaction);
}
