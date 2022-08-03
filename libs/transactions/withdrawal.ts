import type Web3 from "web3";
import path from "path";
import { parentLogger } from "../utils";
import { submitTransaction } from "./helpers/submit";
import type { Client } from "../client";
import type { NightfallZkpKeys } from "../nightfall/types";
import type { TransactionReceipt } from "web3-core";

const logger = parentLogger.child({
  name: path.relative(process.cwd(), __filename),
});

export async function createAndSubmitWithdrawal(
  isOffChain: boolean,
  token: any, // Token,
  ownerAddress: string,
  ownerPrivateKey: string,
  ownerZkpKeys: NightfallZkpKeys,
  recipientAddress: string, // TODO consider renaming
  shieldContractAddress: string,
  value: string,
  fee: string,
  web3: Web3,
  client: Client,
) {
  logger.debug("createAndSubmitDeposit");

  const resData = await client.withdraw(
    isOffChain,
    token,
    ownerZkpKeys,
    value,
    fee,
    recipientAddress,
  );
  // resData null signals that something went wrong in the Client
  if (resData === null) return;

  // CHECK what does endpoint return for Offchain?
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
        fee,
        web3,
      );
    } catch (err) {
      logger.child({ unsignedTx }).error(err);
      return null;
    }
    return { txL1: txReceipt, txL2: resData.transaction };
  }
  return resData.status;
}
