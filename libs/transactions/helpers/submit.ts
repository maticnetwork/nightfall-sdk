import type Web3 from "web3";
import path from "path";
import { parentLogger } from "../../utils";
import type { TransactionReceipt } from "web3-core";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

const GAS = process.env.GAS || 4000000;
const GAS_PRICE = process.env.GAS_PRICE || 10000000000;
const GAS_ESTIMATE_ENDPOINT =
  process.env.GAS_ESTIMATE_ENDPOINT ||
  "https://vqxy02tr5e.execute-api.us-east-2.amazonaws.com/production/estimateGas";

const GAS_MULTIPLIER = Number(process.env.GAS_MULTIPLIER) || 2;
const GAS_PRICE_MULTIPLIER = Number(process.env.GAS_PRICE_MULTIPLIER) || 2;

/**
 * Create, sign and broadcast an Ethereum transaction to the network
 * 
 * @function submitTransaction 
 * @param {string} senderAddress the Eth address sending the contents of the transaction
 * @param {string} senderPrivateKey the Eth private key of the sender to sign the transaction
 * @param {string} recipientAddress the Eth address receiving the contents of the transaction
 * @param {string} unsignedTx the contents of the transaction (sent in data)
 * @param {Web3} web3 web3js instance
 * @param {string} fee the amount of Wei to pay to a proposer for processing the transaction
 * @returns {Promise} Will resolve into an Ethereum <TransactionReceipt>
 */
export async function submitTransaction(
  senderAddress: string,
  senderPrivateKey: string,
  recipientAddress: string,
  unsignedTx: string,
  web3: Web3,
  fee = "0",
): Promise<TransactionReceipt> {
  const logInput = {
    from: senderAddress,
    to: recipientAddress,
    unsignedTx,
    fee,
  };
  logger.debug({ logInput }, "submitTransaction");

  // Estimate gas
  const gas = Math.ceil(Number(GAS) * GAS_MULTIPLIER); // ISSUE #28
  const gasPrice = Math.ceil(Number(GAS_PRICE) * GAS_PRICE_MULTIPLIER); // ISSUE #28
  logger.debug(
    `Transaction gasPrice was set at ${Math.ceil(
      gasPrice / 10 ** 9,
    )} GWei, gas limit was set at ${gas}`,
  );

  const tx = {
    from: senderAddress,
    to: recipientAddress,
    data: unsignedTx,
    gas,
  };
  logger.debug({ tx }, "Sign tx...");
  const signedTx = await web3.eth.accounts.signTransaction(
    tx,
    senderPrivateKey,
  );

  logger.debug({ signedTx }, "Send signedTx...");
  return web3.eth.sendSignedTransaction(signedTx.rawTransaction);
}
