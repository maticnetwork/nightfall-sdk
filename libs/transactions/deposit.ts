import type Web3 from "web3";
import path from "path";
import { parentLogger } from "../utils";
// import type { Token } from "../tokens";
import { submitTransaction } from "./helpers/submit";
import type { Client } from "../client";
import type { NightfallZkpKeys } from "../nightfall/types";
import type { TransactionReceipt } from "web3-core";
import type { OnChainTransactionReceipts } from "./types";
import { NightfallSdkError } from "../utils/error";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

/**
 * Handle the flow for deposit transaction (tx)
 *
 * @async
 * @function createAndSubmitDeposit
 * @param {*} token An instance of Token holding token data such as contract address
 * @param {string} ownerEthAddress Eth address sending the contents of the deposit
 * @param {undefined | string} ownerEthPrivateKey Eth private key of the sender to sign the tx
 * @param {NightfallZkpKeys} ownerZkpKeys Sender's set of Zero-knowledge proof keys
 * @param {string} shieldContractAddress Address of the Shield smart contract (recipient)
 * @param {Web3} web3 web3js instance
 * @param {Client} client An instance of Client to interact with the API
 * @param {string} value The amount in Wei of the token to be deposited
 * @param {string} tokenId The tokenId of an erc721
 * @param {string} fee The amount in Wei to pay a proposer for the tx
 * @throws {NightfallSdkError} Error while broadcasting tx
 * @returns {Promise<OnChainTransactionReceipts>}
 */
export async function createAndSubmitDeposit(
  token: any,
  ownerEthAddress: string,
  ownerEthPrivateKey: undefined | string,
  ownerZkpKeys: NightfallZkpKeys,
  shieldContractAddress: string,
  web3: Web3,
  client: Client,
  value: string,
  tokenId: string,
  fee: string,
): Promise<OnChainTransactionReceipts> {
  logger.debug("createAndSubmitDeposit");

  const resData = await client.deposit(
    token,
    ownerZkpKeys,
    value,
    tokenId,
    fee,
  );
  const txReceiptL2 = resData.transaction;
  const unsignedTx = resData.txDataToSign;
  logger.debug({ unsignedTx }, "Deposit tx, unsigned");

  let txReceipt: TransactionReceipt;
  try {
    txReceipt = await submitTransaction(
      ownerEthAddress,
      ownerEthPrivateKey,
      shieldContractAddress,
      unsignedTx,
      web3,
      fee,
    );
  } catch (err) {
    logger.child({ resData }).error(err, "Error when submitting transaction");
    throw new NightfallSdkError(err);
  }

  return { txReceipt, txReceiptL2 };
}
