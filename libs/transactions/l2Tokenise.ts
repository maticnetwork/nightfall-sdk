import { logger } from "../utils";
import type { Client } from "../client";
import type { NightfallZkpKeys } from "../nightfall/types";
import type { OffChainTransactionReceipt } from "./types";

/**
 * Handle the flow for tokenisation transaction (tx)
 *
 * @async
 * @function createAndSubmitTokenise
 * @param {NightfallZkpKeys} ownerZkpKeys Sender's set of Zero-knowledge proof keys
 * @param {Client} client An instance of Client to interact with the API
 * @param {string} tokenAddress Token address to be minted in L2
 * @param {string} value The amount in Wei of the token to be minted
 * @param {string} tokenId The tokenId of the token to be minted
 * @param {string} salt Random Salt
 * @param {string} fee Proposer payment in Wei for the tx in L2
 * @returns {Promise<OffChainTransactionReceipt>}
 */
export async function createAndSubmitTokenise(
  ownerZkpKeys: NightfallZkpKeys,
  client: Client,
  tokenAddress: string,
  value: string,
  tokenId: string,
  salt: string,
  fee: string,
): Promise<OffChainTransactionReceipt> {
  logger.debug("createAndSubmitTokenise");

  const resData = await client.tokenise(
    ownerZkpKeys,
    tokenAddress,
    value,
    tokenId,
    salt,
    fee,
  );
  const txReceiptL2 = resData.transaction;

  return { txReceiptL2 };
}
