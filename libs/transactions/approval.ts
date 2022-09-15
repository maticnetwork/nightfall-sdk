import type Web3 from "web3";
import path from "path";
import { parentLogger } from "../utils";
// import type { Token } from "../tokens";
import { submitTransaction } from "./helpers/submit";
import type { TransactionReceipt } from "web3-core";
import { NightfallSdkError } from "../utils/error";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

/**
 * Handle the flow for approval transaction (tx)
 * this is to update the spender allowance before a deposit tx
 *
 * @async
 * @function createAndSubmitApproval
 * @param {*} token An instance of Token holding token data such as contract address
 * @param {string} ownerEthAddress Eth address which may own some token balance
 * @param {string} ownerEthPrivateKey Eth private key of the sender to sign the tx
 * @param {string} spenderEthAddress Eth address of the Shield smart contract (spender)
 * @param {Web3} web3 web3js instance
 * @param {string} value The amount in Wei of the token to be deposited later
 * @throws {NightfallSdkError} Error while interacting with token contract or while broadcasting tx
 * @returns {Promise<null | TransactionReceipt>} Should resolve `null` if approval is not required, else Eth tx receipt
 */
export async function createAndSubmitApproval(
  token: any, // Token,
  ownerEthAddress: string,
  ownerEthPrivateKey: string,
  spenderEthAddress: string,
  web3: Web3,
  value: string,
): Promise<null | TransactionReceipt> {
  logger.debug("createAndSubmitApproval");

  let txReceipt: TransactionReceipt;
  try {
    console.log("the tokensss", token);
    console.log("spender", spenderEthAddress);
    console.log(ownerEthAddress);
    console.log("shiield 0x9f34fe84bb91235a2357716e7a868359768fe3b7");

    const unsignedTx = await token.approveTransaction(
      ownerEthAddress,
      spenderEthAddress,
      value,
    );
    // unsignedTx `null` signals that the approval is not required (no tx to sign and submit)
    if (unsignedTx === null) return null;
    logger.debug({ unsignedTx }, "Approval tx, unsigned");

    txReceipt = await submitTransaction(
      ownerEthAddress,
      ownerEthPrivateKey,
      token.contractAddress,
      unsignedTx,
      web3,
    );
  } catch (err) {
    logger.error(err);
    throw new NightfallSdkError(err.message);
  }

  return txReceipt;
}
