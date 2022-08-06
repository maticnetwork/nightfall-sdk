import type Web3 from "web3";
import path from "path";
import { parentLogger } from "../utils";
import { submitTransaction } from "./helpers/submit";
import type { Client } from "../client";
import type { TransactionReceipt } from "web3-core";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

export async function createAndSubmitFinaliseWithdrawal(
  withdrawTxHash: string,
  ownerAddress: string,
  ownerPrivateKey: string,
  shieldContractAddress: string,
  fee: string,
  web3: Web3,
  client: Client,
) {
  logger.debug("createAndSubmitDeposit");

  const resData = await client.finaliseWithdrawal(withdrawTxHash);
  // resData null signals that something went wrong in the Client
  if (resData === null) return;

  const unsignedTx = resData.txDataToSign;
  logger.debug({ unsignedTx }, "Finalise withdrawal tx, unsigned");

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
  return { txL1: txReceipt };
}
