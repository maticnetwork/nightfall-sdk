import type Web3 from "web3";
import path from "path";
import { parentLogger } from "../utils";
// import type { Token } from "../tokens";
import { submitTransaction } from "./helpers/submit";
import type { Client } from "../client";
import type { NightfallZkpKeys } from "../nightfall/types";
import type { TransactionReceipt } from "web3-core";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

export async function createAndSubmitDeposit(
  token: any, // Token,
  ownerAddress: string,
  ownerPrivateKey: string,
  ownerZkpKeys: NightfallZkpKeys,
  shieldContractAddress: string,
  web3: Web3,
  client: Client,
  value: string,
  fee: string,
) {
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
      web3,
      fee,
    );
  } catch (err) {
    logger.child({ unsignedTx }).error(err);
    return null;
  }
  return { txL1: txReceipt, txL2: resData.transaction };
}
