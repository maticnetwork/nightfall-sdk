import type Web3 from "web3";
import type { TransactionConfig, TransactionReceipt } from "web3-core";
import { logger, NightfallSdkError } from "../../utils";
import { estimateGas, estimateGasPrice } from "../../ethereum";

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
 * @param {string} value Proposer payment for the tx in L1
 * @returns {Promise<TransactionReceipt>}
 */
export async function submitTransaction(
  senderEthAddress: string,
  senderEthPrivateKey: undefined | string,
  recipientEthAddress: string,
  unsignedTx: string,
  web3: Web3,
  value = "0",
): Promise<TransactionReceipt> {
  logger.debug(
    { senderEthAddress, recipientEthAddress, unsignedTx, value },
    "submitTransaction",
  );

  const isListening = await web3.eth.net.isListening();
  if (!isListening)
    throw new NightfallSdkError(
      "Web3 websocket not listening, try again later",
    );

  // Estimate gasPrice
  const gasPrice = await estimateGasPrice(web3);

  // Ethereum tx
  const tx: TransactionConfig = {
    from: senderEthAddress,
    to: recipientEthAddress,
    data: unsignedTx,
    value,
    gasPrice,
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
  logger.debug({ tx }, "Sign tx...");
  const signedTx = await web3.eth.accounts.signTransaction(
    tx,
    senderEthPrivateKey,
  );

  logger.debug({ signedTx }, "Send signedTx...");
  return web3.eth.sendSignedTransaction(signedTx.rawTransaction);
}
