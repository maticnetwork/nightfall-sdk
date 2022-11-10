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
 * Handle the flow for token burning transaction (tx)
 *
 * @async
 * @function createAndSubmitBurn
 * @param {NightfallZkpKeys} ownerZkpKeys Sender's set of Zero-knowledge proof keys
 * @param {Client} client An instance of Client to interact with the API
 * @param {string} tokenAddress Token address to be burnt
 * @param {string} tokenId The tokenId of L2 token to be burnt
 * @param {number} value The amount in Wei of the token to be burnt
 * @param {string} fee The amount in Wei to pay a proposer for the tx (optional)
 * @returns {Promise<OffChainTransactionReceipt>}
 */
export async function createAndSubmitBurn(
  ownerZkpKeys: NightfallZkpKeys,
  client: Client,
  tokenAddress: string,
  tokenId: string,
  value: number,
  fee?: string,
): Promise<OffChainTransactionReceipt> {
  logger.debug("createAndSubmitBurn");

  const resData = await client.burn(
    ownerZkpKeys,
    tokenAddress,
    tokenId,
    value,
    fee,
  );
  const txReceiptL2 = resData.transaction;

  return { txReceiptL2 };
}
