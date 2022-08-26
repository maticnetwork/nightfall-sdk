import type Web3 from "web3";
import path from "path";
import { parentLogger } from "../utils";
import { submitTransaction } from "./helpers/submit";
import type { Client } from "../client";
import type { NightfallZkpKeys } from "../nightfall/types";
import type { TransactionReceipt } from "web3-core";
import type {
  OffChainTransactionReceipt,
  OnChainTransactionReceipts,
} from "./types";
import { NightfallSdkError } from "../utils/error";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

/**
 * Handle the flow for withdrawal transaction (tx)
 *
 * @async
 * @function createAndSubmitWithdrawal
 * @param {*} token An instance of Token holding token data such as contract address
 * @param {string} ownerEthAddress Eth address sending the contents of the withdrawal
 * @param {string} ownerEthPrivateKey Eth private key of the sender to sign the tx
 * @param {NightfallZkpKeys} ownerZkpKeys Sender's set of Zero-knowledge proof keys
 * @param {string} shieldContractAddress Address of the Shield smart contract
 * @param {Web3} web3 web3js instance
 * @param {Client} client An instance of Client to interact with the API
 * @param {string} value The amount in Wei of the token to be withdrawn
 * @param {string} fee The amount in Wei to pay a proposer for the tx
 * @param {string} recipientEthAddress Recipient Eth address
 * @param {boolean} isOffChain If true, tx will be sent to the proposer's API (handled off-chain)
 * @throws {NightfallSdkError} Error while broadcasting on-chain tx
 * @returns {Promise<OnChainTransactionReceipts | OffChainTransactionReceipt>}
 */
export async function createAndSubmitWithdrawal(
  token: any,
  ownerAddress: string,
  ownerPrivateKey: string,
  ownerZkpKeys: NightfallZkpKeys,
  shieldContractAddress: string,
  web3: Web3,
  client: Client,
  value: string,
  fee: string,
  recipientEthAddress: string,
  isOffChain: boolean,
): Promise<OnChainTransactionReceipts | OffChainTransactionReceipt> {
  logger.debug("createAndSubmitWithdrawal");

  const resData = await client.withdraw(
    token,
    ownerZkpKeys,
    value,
    fee,
    recipientEthAddress,
    isOffChain,
  );
  const txReceiptL2 = resData.transaction;

  if (!isOffChain) {
    const unsignedTx = resData.txDataToSign;
    logger.debug({ unsignedTx }, "Withdrawal tx, unsigned");

    let txReceipt: TransactionReceipt;
    try {
      txReceipt = await submitTransaction(
        ownerAddress,
        ownerPrivateKey,
        shieldContractAddress,
        unsignedTx,
        web3,
      );
    } catch (err) {
      logger.child({ resData }).error(err);
      throw new NightfallSdkError(err.message);
    }
    return { txReceipt, txReceiptL2 };
  }

  return { txReceiptL2 };
}
