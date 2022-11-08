import path from "path";
import { parentLogger } from "../utils";
// import type { Token } from "../tokens";
import type { Client } from "../client";
import type { NightfallZkpKeys } from "../nightfall/types";
import type { OffChainTransactionReceipt } from "./types";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

/**
 * Handle the flow for tokenisation transaction (tx)
 *
 * @async
 * @function createAndSubmitTokenise
 * @param {NightfallZkpKeys} ownerZkpKeys Sender's set of Zero-knowledge proof keys
 * @param {Client} client An instance of Client to interact with the API
 * @param {string} value The amount in Wei of the token to be deposited
 * @param {string} tokenId The tokenId of an erc721
 * @param {string} tokenAddress Token address (optional)
 * @param {string} salt Random Salt (optional)
 * @param {string} fee The amount in Wei to pay a proposer for the tx (optional)
 * @returns {Promise<OffChainTransactionReceipt>}
 */
export async function createAndSubmitTokenise(
  ownerZkpKeys: NightfallZkpKeys,
  client: Client,
  value: string,
  tokenId: string,
  tokenAddress?: string,
  salt?: string,
  fee?: string,
): Promise<OffChainTransactionReceipt> {
  logger.debug("createAndSubmitTokenise");

  const resData = await client.tokenise(
    ownerZkpKeys,
    value,
    tokenId,
    tokenAddress,
    salt,
    fee,
  );
  const txReceiptL2 = resData.transaction;

  return { txReceiptL2 };
}
