import Web3 from "web3";
import path from "path";
import { parentLogger } from "../utils";
import { Token } from "../tokens";
import { submitTransaction } from "./helpers/submit";
import { Client } from "../client";
import type { NightfallZkpKeys } from "../nightfall/types";
import type { TransactionReceipt } from "web3-core";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

// TODO improve return type
export async function createAndSubmitDeposit(
  token: Token,
  ownerAddress: string,
  ownerPrivateKey: string,
  ownerZkpKeys: NightfallZkpKeys,
  shieldContractAddress: string,
  value: string,
  fee: number,
  web3: Web3,
  client: Client,
): Promise<void | null | TransactionReceipt> {
  logger.debug("createAndSubmitDeposit");

  const resData = await client.deposit(token, ownerZkpKeys, value, fee);
  // resData null signals that something went wrong in the Client
  if (resData === null) return;

  const unsignedTx = resData.txDataToSign;
  logger.debug({ unsignedTx }, "Deposit tx, unsigned");

  let txReceipt: TransactionReceipt;
  try {
    txReceipt = await submitTransaction(
      ownerAddress,
      ownerPrivateKey,
      shieldContractAddress,
      unsignedTx,
      fee,
      web3,
    );
  } catch (err) {
    logger.child({ unsignedTx }).error(err);
    return null;
  }
  return txReceipt;
}
