import type Web3 from "web3";
import path from "path";
import { parentLogger } from "../utils";
import { submitTransaction } from "./helpers/submit";
import type { Client } from "../client";
import type { NightfallZkpKeys } from "../nightfall/types";
import type { TransactionReceipt } from "web3-core";
import { Transaction } from "libs/types";
import { NightfallRecipientData } from "./types";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

/**
 * Handle the flow for transfer transactions
 *
 * @method createAndSubmitTransfer
 * @param {} token An instance of Token holding token info such as contract address
 * @param {string} ownerAddress Eth address sending the contents of the transfer  // TODO review names
 * @param {string} ownerPrivateKey Eth private key of the sender to sign the transaction
 * @param {NightfallZkpKeys} ownerZkpKeys Sender's set of Zero-knowledge proof keys
 * @param {string} shieldContractAddress Address of the Shield smart contract
 * @param {Web3} web3 web3js instance
 * @param {Client} client An instance of Client to interact with the API
 * @param {string} value The amount of the token to be transferred
 * @param {string} fee The amount in Wei to pay a proposer for the transaction
 * @param {string} nightfallRecipientAddress Compressed Zkp public key of the recipient in L2
 * @param {boolean} isOffChain If true, transaction will be sent to the proposer's API (handled off-chain)
 * @returns // TODO
 */
export async function createAndSubmitTransfer(
  token: any,
  ownerAddress: string,
  ownerPrivateKey: string,
  ownerZkpKeys: NightfallZkpKeys,
  shieldContractAddress: string,
  web3: Web3,
  client: Client,
  value: string,
  fee: string,
  nightfallRecipientAddress: string,
  isOffChain: boolean,
): Promise<{ txL1: TransactionReceipt; txL2: Transaction }> | null {
  logger.debug("createAndSubmitTransfer");

  const nightfallRecipientData: NightfallRecipientData = {
    recipientCompressedZkpPublicKeys: [nightfallRecipientAddress],
    values: [value],
  };
  const resData = await client.transfer(
    token,
    ownerZkpKeys,
    nightfallRecipientData,
    fee,
    isOffChain,
  );

  // resData null signals that something went wrong in the Client
  if (resData === null) return null;

  if (!isOffChain) {
    const unsignedTx = resData.txDataToSign;
    logger.debug({ unsignedTx }, "Transfer tx, unsigned");

    let txReceipt: TransactionReceipt;
    try {
      txReceipt = await submitTransaction(
        ownerAddress,
        ownerPrivateKey,
        shieldContractAddress,
        unsignedTx,
        web3,
        fee,
      );
    } catch (err) {
      logger.child({ unsignedTx }).error(err);
      return null;
    }
    return { txL1: txReceipt, txL2: resData.transaction };
  }
}
