import type Web3 from "web3";
import path from "path";
import { parentLogger } from "../utils";
import { submitTransaction } from "./helpers/submit";
import type { Client } from "../client";
import type { NightfallZkpKeys } from "../nightfall/types";
import type { TransactionReceipt } from "web3-core";
import type {
  RecipientNightfallData,
  OffChainTransactionReceipt,
  OnChainTransactionReceipts,
} from "./types";
import { NightfallSdkError } from "../utils/error";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

/**
 * Handle the flow for transfer transaction (tx)
 *
 * @async
 * @function createAndSubmitTransfer
 * @param {*} token An instance of Token holding token data such as contract address
 * @param {string} ownerEthAddress Eth address sending the contents of the transfer
 * @param {string} ownerEthPrivateKey Eth private key of the sender to sign the tx
 * @param {NightfallZkpKeys} ownerZkpKeys Sender's set of Zero-knowledge proof keys
 * @param {string} shieldContractAddress Address of the Shield smart contract
 * @param {Web3} web3 web3js instance
 * @param {Client} client An instance of Client to interact with the API
 * @param {string} value The amount in Wei of the token to be transferred
 * @param {string} fee The amount in Wei to pay a proposer for the tx
 * @param {string} recipientNightfallAddress Recipient zkpKeys.compressedZkpPublicKey
 * @param {boolean} isOffChain If true, tx will be sent to the proposer's API (handled off-chain)
 * @throws {NightfallSdkError} Error while broadcasting on-chain tx
 * @returns {Promise<OnChainTransactionReceipts | OffChainTransactionReceipt>}
 */
export async function createAndSubmitTransfer(
  token: any,
  ownerEthAddress: string,
  ownerEthPrivateKey: string,
  ownerZkpKeys: NightfallZkpKeys,
  shieldContractAddress: string,
  web3: Web3,
  client: Client,
  value: string,
  fee: string,
  recipientNightfallAddress: string,
  isOffChain: boolean,
): Promise<OnChainTransactionReceipts | OffChainTransactionReceipt> {
  logger.debug("createAndSubmitTransfer");

  const recipientNightfallData: RecipientNightfallData = {
    recipientCompressedZkpPublicKeys: [recipientNightfallAddress],
    values: [value],
  };
  const resData = await client.transfer(
    token,
    ownerZkpKeys,
    recipientNightfallData,
    fee,
    isOffChain,
  );
  const txReceiptL2 = resData.transaction;

  if (!isOffChain) {
    const unsignedTx = resData.txDataToSign;
    logger.debug({ unsignedTx }, "Transfer tx, unsigned");

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
    return { txReceipt, txReceiptL2 };
  }

  return { txReceiptL2 };
}
