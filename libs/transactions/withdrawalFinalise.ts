import type Web3 from "web3";
import path from "path";
import { parentLogger } from "../utils";
import { submitTransaction } from "./helpers/submit";
import type { Client } from "../client";
import type { TransactionReceipt } from "web3-core";
import { NightfallSdkError } from "../utils/error";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

/**
 * Handle the flow for finalising previously initiated withdrawal transaction (tx)
 *
 * @async
 * @function createAndSubmitFinaliseWithdrawal
 * @param {string} ownerEthAddress Eth address sending the contents of the tx
 * @param {undefined | string} ownerEthPrivateKey Eth private key of the sender to sign the tx
 * @param {string} shieldContractAddress Address of the Shield smart contract
 * @param {Web3} web3 web3js instance
 * @param {Client} client An instance of Client to interact with the API
 * @param {string} withdrawTxHashL2 Tx hash in Layer2 of the previously initiated withdrawal
 * @throws {NightfallSdkError} Error while broadcasting tx
 * @returns {Promise<TransactionReceipt>}
 */
export async function createAndSubmitFinaliseWithdrawal(
  ownerEthAddress: string,
  ownerEthPrivateKey: undefined | string,
  shieldContractAddress: string,
  web3: Web3,
  client: Client,
  withdrawTxHashL2: string,
): Promise<TransactionReceipt> {
  logger.debug("createAndSubmitFinaliseWithdrawal");

  const resData = await client.finaliseWithdrawal(withdrawTxHashL2);
  const unsignedTx = resData.txDataToSign;
  logger.debug({ unsignedTx }, "Finalise withdrawal tx, unsigned");

  let txReceipt: TransactionReceipt;
  try {
    txReceipt = await submitTransaction(
      ownerEthAddress,
      ownerEthPrivateKey,
      shieldContractAddress,
      unsignedTx,
      web3,
    );
  } catch (err) {
    logger.child({ resData }).error(err);
    throw new NightfallSdkError(err.message);
  }
  return txReceipt;
}
