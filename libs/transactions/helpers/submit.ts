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
 * @function submitTransaction create, sign and send broadcast a transaction to the network
 * @param senderAddress - the address of who is doing the transfer
 * @param senderPrivateKey - the private key of the sender to sing the transaction
 * @param recipientAddress - the zkp public key of the recipient
 * @param unsignedTx - the tx data to be signed
 * @param fee - the amount (Wei) to pay a proposer for the transaction
 * is being taken.  Note that the Nightfall_3 State.sol contract must be approved
 * by the token's owner to be able to withdraw the token
 * @param web3 - web3js instance
 * @returns
 */
export async function submitTransaction(
  senderAddress: string,
  senderPrivateKey: string,
  recipientAddress: string,
  unsignedTx: string,
  fee: string,
  web3: Web3,
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

  const signedTx = await web3.eth.accounts.signTransaction(
    tx,
    senderPrivateKey,
  );
  return web3.eth.sendSignedTransaction(signedTx.rawTransaction);
}
